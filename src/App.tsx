import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TabType, BillingType, Bill, Expense, InventoryItem, NotificationItem, BusinessConfig, AuthSession } from './types';
import {
  INITIAL_BILLS,
  INITIAL_EXPENSES,
  INITIAL_INVENTORY,
  INITIAL_PRODUCTS,
  INITIAL_NOTIFICATIONS
} from './data/initialData';
import { loadSavedBusinessConfig, saveBusinessConfig } from './data/businessPresets';
import { getActiveSession, clearActiveSession } from './data/authService';
import {
  testFirestoreConnection,
  subscribeToBills,
  saveBillToFirestore,
  seedInitialBillsIfEmpty,
  subscribeToExpenses,
  saveExpenseToFirestore,
  seedInitialExpensesIfEmpty,
  subscribeToBusinessConfig,
  saveBusinessConfigToFirestore,
  seedInitialConfigIfEmpty,
  subscribeToNotifications,
  saveNotificationToFirestore,
  seedInitialNotificationsIfEmpty,
  subscribeToUsers
} from './lib/firebase';
import { mergeUsersWithLocalCache } from './data/authService';
import { AuthView } from './components/AuthView';
import { TopAppBar } from './components/TopAppBar';
import { BottomNavBar } from './components/BottomNavBar';
import { DashboardView } from './components/DashboardView';
import { BillingView } from './components/BillingView';
import { AnalyticsView } from './components/AnalyticsView';
import { ExpensesView } from './components/ExpensesView';
import { BusinessConfigView } from './components/BusinessConfigView';
import { InvoiceModal } from './components/InvoiceModal';
import { AddExpenseModal } from './components/AddExpenseModal';
import { RemindersModal } from './components/RemindersModal';
import { AllProductsModal } from './components/AllProductsModal';
import { AutomateBillingModal } from './components/AutomateBillingModal';
import { MobileInstallModal } from './components/MobileInstallModal';

export default function App() {
  const [session, setSession] = useState<AuthSession | null>(() => getActiveSession());
  const [businessConfig, setBusinessConfig] = useState<BusinessConfig>(() => loadSavedBusinessConfig());
  const [currentTab, setCurrentTab] = useState<TabType>('dashboard');
  const [billingInitialType, setBillingInitialType] = useState<BillingType>('raw');
  const [currency, setCurrency] = useState<string>(() => loadSavedBusinessConfig().currency || '$');

  // Application Data States
  const [bills, setBills] = useState<Bill[]>(INITIAL_BILLS);
  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES);
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(false);

  // Initialize and synchronize with Firebase Firestore live cloud database
  useEffect(() => {
    let unsubscribeBills: (() => void) | undefined;
    let unsubscribeExpenses: (() => void) | undefined;
    let unsubscribeConfig: (() => void) | undefined;
    let unsubscribeNotifs: (() => void) | undefined;
    let unsubscribeUsers: (() => void) | undefined;

    async function initFirebaseSync() {
      try {
        await testFirestoreConnection();
        setIsFirebaseConnected(true);

        // Seed initial collections in Firestore if empty
        await seedInitialBillsIfEmpty(INITIAL_BILLS);
        await seedInitialExpensesIfEmpty(INITIAL_EXPENSES);
        await seedInitialConfigIfEmpty(businessConfig);
        await seedInitialNotificationsIfEmpty(INITIAL_NOTIFICATIONS);

        // Real-time Firestore listeners
        unsubscribeBills = subscribeToBills((remoteBills) => {
          if (remoteBills && remoteBills.length > 0) {
            setBills(remoteBills);
          }
        });

        unsubscribeExpenses = subscribeToExpenses((remoteExpenses) => {
          if (remoteExpenses && remoteExpenses.length > 0) {
            setExpenses(remoteExpenses);
          }
        });

        unsubscribeConfig = subscribeToBusinessConfig((remoteConfig) => {
          if (remoteConfig && remoteConfig.businessName) {
            setBusinessConfig(remoteConfig);
            if (remoteConfig.currency) {
              setCurrency(remoteConfig.currency);
            }
          }
        });

        unsubscribeNotifs = subscribeToNotifications((remoteNotifs) => {
          if (remoteNotifs && remoteNotifs.length > 0) {
            setNotifications(remoteNotifs);
          }
        });

        unsubscribeUsers = subscribeToUsers((remoteUsers) => {
          if (remoteUsers && remoteUsers.length > 0) {
            mergeUsersWithLocalCache(remoteUsers);
          }
        });
      } catch (err) {
        console.warn('Firebase Firestore sync note:', err);
      }
    }

    initFirebaseSync();

    return () => {
      if (unsubscribeBills) unsubscribeBills();
      if (unsubscribeExpenses) unsubscribeExpenses();
      if (unsubscribeConfig) unsubscribeConfig();
      if (unsubscribeNotifs) unsubscribeNotifs();
      if (unsubscribeUsers) unsubscribeUsers();
    };
  }, []);

  // Modal States
  const [activeInvoice, setActiveInvoice] = useState<Bill | null>(null);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isRemindersOpen, setIsRemindersOpen] = useState(false);
  const [isAllProductsOpen, setIsAllProductsOpen] = useState(false);
  const [isAutomateModalOpen, setIsAutomateModalOpen] = useState(false);
  const [isMobileInstallOpen, setIsMobileInstallOpen] = useState(false);

  // Navigation helper for quick actions from Dashboard
  const handleNavigateToBilling = (type: BillingType) => {
    setBillingInitialType(type);
    setCurrentTab('billing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Bill handlers
  const handleAddBill = (newBill: Bill) => {
    setBills([newBill, ...bills]);
    saveBillToFirestore(newBill).catch((err) => console.warn('Firestore bill save error:', err));

    // Add success notification
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: `Invoice Generated: ${newBill.billNumber}`,
      description: `${newBill.type === 'gst' ? 'GST Invoice' : 'Raw Bill'} created for ${newBill.customerName} (${newBill.currency}${newBill.total.toLocaleString()}).`,
      time: 'Just now',
      read: false,
      type: 'success'
    };
    setNotifications([newNotif, ...notifications]);
    saveNotificationToFirestore(newNotif).catch((err) => console.warn('Firestore notif save error:', err));
  };

  const handleToggleBillStatus = (billId: string) => {
    let updatedBill: Bill | null = null;
    setBills((prev) =>
      prev.map((b) => {
        if (b.id === billId) {
          updatedBill = { ...b, status: b.status === 'paid' ? 'pending' : 'paid' };
          return updatedBill;
        }
        return b;
      })
    );
    if (updatedBill) {
      saveBillToFirestore(updatedBill).catch((err) => console.warn('Firestore bill status update error:', err));
    }
    if (activeInvoice && activeInvoice.id === billId) {
      setActiveInvoice((prev) =>
        prev
          ? {
              ...prev,
              status: prev.status === 'paid' ? 'pending' : 'paid'
            }
          : null
      );
    }
  };

  // Expense handlers
  const handleAddExpense = (expData: Omit<Expense, 'id'>) => {
    const newExp: Expense = {
      ...expData,
      id: `exp-${Date.now()}`
    };
    setExpenses([newExp, ...expenses]);
    saveExpenseToFirestore(newExp).catch((err) => console.warn('Firestore expense save error:', err));

    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: `New Expense Added: ${newExp.title}`,
      description: `${currency}${newExp.amount.toLocaleString()} for ${newExp.category}.`,
      time: 'Just now',
      read: false,
      type: 'info'
    };
    setNotifications([newNotif, ...notifications]);
    saveNotificationToFirestore(newNotif).catch((err) => console.warn('Firestore notif save error:', err));
  };

  // Restock inventory item
  const handleRestockItem = (sku: string, addQty: number) => {
    setInventory((prev) =>
      prev.map((item) =>
        item.sku === sku
          ? { ...item, currentQty: item.currentQty + addQty }
          : item
      )
    );

    const item = inventory.find((i) => i.sku === sku);
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: `Restocked ${item?.name || sku}`,
      description: `Added ${addQty} units. Total on hand: ${(item?.currentQty || 0) + addQty}.`,
      time: 'Just now',
      read: false,
      type: 'success'
    };
    setNotifications([newNotif, ...notifications]);
    saveNotificationToFirestore(newNotif).catch((err) => console.warn('Firestore notif save error:', err));
  };

  // Notification handlers
  const handleMarkNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => {
        if (n.id === id) {
          const updated = { ...n, read: true };
          saveNotificationToFirestore(updated).catch((err) => console.warn('Firestore notif update error:', err));
          return updated;
        }
        return n;
      })
    );
  };

  const handleClearAllNotifications = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleTriggerCustomNotification = (title: string, desc: string) => {
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title,
      description: desc,
      time: 'Just now',
      read: false,
      type: 'info'
    };
    setNotifications([newNotif, ...notifications]);
    saveNotificationToFirestore(newNotif).catch((err) => console.warn('Firestore notif save error:', err));
  };

  const handleCurrencyToggle = () => {
    setCurrency((prev) => {
      const next = prev === '$' ? '₹' : prev === '₹' ? '€' : prev === '€' ? '£' : '$';
      const updated = { ...businessConfig, currency: next };
      setBusinessConfig(updated);
      saveBusinessConfig(updated);
      saveBusinessConfigToFirestore(updated).catch((err) => console.warn('Firestore config save error:', err));
      return next;
    });
  };

  const handleSaveBusinessConfig = (newConfig: BusinessConfig) => {
    setBusinessConfig(newConfig);
    saveBusinessConfig(newConfig);
    saveBusinessConfigToFirestore(newConfig).catch((err) => console.warn('Firestore config save error:', err));
    setCurrency(newConfig.currency);
    handleTriggerCustomNotification(
      'Business Profile Saved (Synced with Firebase)',
      `${newConfig.businessName} configuration saved to Google Cloud Firestore.`
    );
  };

  const handleLoginSuccess = (newSession: AuthSession) => {
    setSession(newSession);
    setCurrentTab('dashboard');
    // If registered user provided a custom business name, synchronize with businessConfig
    if (newSession.user.businessName && newSession.user.businessName.trim() !== '') {
      const updatedConfig = {
        ...businessConfig,
        businessName: newSession.user.businessName,
        brandShort: newSession.user.businessName
          .split(' ')
          .map((w) => w[0])
          .slice(0, 2)
          .join('')
          .toUpperCase() || 'RF',
        email: newSession.user.email || businessConfig.email,
        phone: newSession.user.phone || businessConfig.phone
      };
      setBusinessConfig(updatedConfig);
      saveBusinessConfig(updatedConfig);
    }
    handleTriggerCustomNotification(
      `Welcome, ${newSession.user.name}!`,
      `Signed in to workspace for ${newSession.user.businessName} as ${newSession.user.role}.`
    );
  };

  const handleLogout = () => {
    clearActiveSession();
    setSession(null);
  };

  const handleResetData = () => {
    setBills(INITIAL_BILLS);
    setExpenses(INITIAL_EXPENSES);
    setInventory(INITIAL_INVENTORY);
    setNotifications(INITIAL_NOTIFICATIONS);
    setCurrency('$');
  };

  // If not authenticated, render the dedicated Registration & Login page
  if (!session) {
    return (
      <AuthView
        onLoginSuccess={handleLoginSuccess}
        config={businessConfig}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col antialiased relative selection:bg-blue-600 selection:text-white">
      {/* Subtle Dot Grid Background */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-40 artistic-grid z-0" 
      />
      {/* Ambient soft background glows */}
      <div className="fixed -right-24 -top-24 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="fixed -left-24 bottom-12 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none z-0" />

      {/* Top App Bar Header */}
      <TopAppBar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        notifications={notifications}
        onMarkNotificationRead={handleMarkNotificationRead}
        onClearAllNotifications={handleClearAllNotifications}
        currency={currency}
        onCurrencyToggle={handleCurrencyToggle}
        config={businessConfig}
        currentUser={session.user}
        onLogout={handleLogout}
        firebaseConnected={isFirebaseConnected}
        onOpenMobileInstall={() => setIsMobileInstallOpen(true)}
      />

      {/* Main Screen Content */}
      <main className="relative z-10 flex-1 w-full max-w-2xl lg:max-w-4xl xl:max-w-5xl mx-auto px-4 sm:px-6 pt-20 sm:pt-24 pb-24 md:pb-12">
        <AnimatePresence mode="wait">
          {currentTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <DashboardView
                onNavigateToBilling={handleNavigateToBilling}
                onOpenReminders={() => setIsRemindersOpen(true)}
                onOpenAllProducts={() => setIsAllProductsOpen(true)}
                onOpenAutomateModal={() => setIsAutomateModalOpen(true)}
                currency={currency}
                bills={bills}
                products={INITIAL_PRODUCTS}
              />
            </motion.div>
          )}

          {currentTab === 'billing' && (
            <motion.div
              key="billing"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <BillingView
                initialType={billingInitialType}
                bills={bills}
                onAddBill={handleAddBill}
                onOpenInvoiceModal={(bill) => setActiveInvoice(bill)}
                currency={currency}
                config={businessConfig}
              />
            </motion.div>
          )}

          {currentTab === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <AnalyticsView currency={currency} />
            </motion.div>
          )}

          {currentTab === 'expenses' && (
            <motion.div
              key="expenses"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <ExpensesView
                expenses={expenses}
                inventory={inventory}
                currency={currency}
                onOpenAddExpense={() => setIsAddExpenseOpen(true)}
                onRestockItem={handleRestockItem}
              />
            </motion.div>
          )}

          {currentTab === 'menu' && (
            <motion.div
              key="menu"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <BusinessConfigView
                config={businessConfig}
                onSaveConfig={handleSaveBusinessConfig}
                onResetData={handleResetData}
                currentUser={session.user}
                onLogout={handleLogout}
                onOpenMobileInstall={() => setIsMobileInstallOpen(true)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Mobile Fixed Bottom Navigation Bar */}
      <BottomNavBar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Modals */}
      <InvoiceModal
        bill={activeInvoice}
        onClose={() => setActiveInvoice(null)}
        onToggleStatus={handleToggleBillStatus}
        config={businessConfig}
      />

      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
        onAddExpense={handleAddExpense}
        currency={currency}
      />

      <RemindersModal
        isOpen={isRemindersOpen}
        onClose={() => setIsRemindersOpen(false)}
        bills={bills}
        onTriggerNotification={handleTriggerCustomNotification}
      />

      <AllProductsModal
        isOpen={isAllProductsOpen}
        onClose={() => setIsAllProductsOpen(false)}
        products={INITIAL_PRODUCTS}
        currency={currency}
      />

      <AutomateBillingModal
        isOpen={isAutomateModalOpen}
        onClose={() => setIsAutomateModalOpen(false)}
        onConfirm={() =>
          handleTriggerCustomNotification(
            'Billing Automation Enabled',
            'Recurring invoices will now be scheduled automatically on the 1st of every month.'
          )
        }
      />

      <MobileInstallModal
        isOpen={isMobileInstallOpen}
        onClose={() => setIsMobileInstallOpen(false)}
      />
    </div>
  );
}
