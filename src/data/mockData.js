export const mockUser = {
  name: "Avinash",
  bankBalance: 40.00, 
  currency: "USD"
};

export const mockSubscriptions = [
  {
    id: "sub-1",
    name: "Netflix",
    category: "Entertainment",
    cost: 19.99,
    status: "active",
    billingCycle: "monthly",
    nextBillingDate: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString(),
    iconUrl: "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg",
    history: [
      { date: "2023-10-01", cost: 15.49 },
      { date: "2024-03-01", cost: 19.99 } // Trigger for price creep
    ]
  },
  {
    id: "sub-2",
    name: "Spotify",
    category: "Music",
    cost: 10.99,
    status: "active",
    billingCycle: "monthly",
    nextBillingDate: new Date(new Date().setDate(new Date().getDate() + 12)).toISOString(),
    iconUrl: "https://upload.wikimedia.org/wikipedia/commons/2/26/Spotify_logo_with_text.svg",
    history: [
      { date: "2023-01-01", cost: 9.99 },
      { date: "2023-09-01", cost: 10.99 }
    ]
  },
  {
    id: "sub-3",
    name: "Amazon Prime",
    category: "Shopping",
    cost: 139.00,
    status: "active",
    billingCycle: "annual",
    nextBillingDate: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString(),
    iconUrl: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg",
    history: [
      { date: "2022-04-15", cost: 119.00 },
      { date: "2023-04-15", cost: 139.00 }
    ]
  },
  {
    id: "sub-4",
    name: "Adobe Creative Cloud",
    category: "Software",
    cost: 54.99,
    status: "active",
    billingCycle: "monthly",
    nextBillingDate: new Date(new Date().setDate(new Date().getDate() + 25)).toISOString(),
    iconUrl: "https://upload.wikimedia.org/wikipedia/commons/4/4c/Adobe_Creative_Cloud_Express_logo.svg",
    history: []
  },
  {
    id: "sub-5",
    name: "Gym Membership",
    category: "Health",
    cost: 45.00,
    status: "active",
    billingCycle: "monthly",
    nextBillingDate: new Date(new Date().setDate(new Date().getDate() + 10)).toISOString(),
    iconUrl: null,
    history: []
  }
];

// Helper to normalize the costs to strict monthly MRR
export const getNormalizedMonthlyMRR = (subscriptions) => {
  return subscriptions.reduce((acc, sub) => {
    if (sub.billingCycle === "annual") {
      return acc + (sub.cost / 12);
    }
    return acc + sub.cost;
  }, 0);
};

export const getCategoryBreakdown = (subscriptions) => {
  const categories = {};
  subscriptions.forEach(sub => {
    const monthlyCost = sub.billingCycle === "annual" ? sub.cost / 12 : sub.cost;
    categories[sub.category] = (categories[sub.category] || 0) + monthlyCost;
  });
  
  return Object.keys(categories).map(key => ({
    name: key,
    value: Number(categories[key].toFixed(2))
  }));
};

export const getUpcomingBills = (subscriptions, days = 30) => {
  const now = new Date();
  const futureDate = new Date();
  futureDate.setDate(now.getDate() + days);

  return subscriptions.filter(sub => {
    const billDate = new Date(sub.nextBillingDate);
    return billDate >= now && billDate <= futureDate;
  }).sort((a, b) => new Date(a.nextBillingDate) - new Date(b.nextBillingDate));
};

export const getAlerts = (subscriptions, balance) => {
  const alerts = [];
  
  subscriptions.forEach(sub => {
    // 1. Check for Price Creep
    if (sub.history && sub.history.length > 1) {
      const sortedHistory = [...sub.history].sort((a, b) => new Date(b.date) - new Date(a.date));
      const latest = sortedHistory[0].cost;
      const previous = sortedHistory[1].cost;
      if (latest > previous) {
        alerts.push({
          id: `alert-creep-${sub.id}`,
          type: "price_creep",
          title: `${sub.name} Price Increase`,
          message: `Your ${sub.name} plan increased by $${(latest - previous).toFixed(2)}. Do you want to review it?`,
          severity: "warning",
          subscriptionId: sub.id
        });
      }
    }

    // 2. Check for Low Balance (Upcoming bill in next 5 days > Balance)
    const nextBill = new Date(sub.nextBillingDate);
    const now = new Date();
    const diffTime = Math.abs(nextBill - now);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    
    if (diffDays <= 5 && sub.cost > balance) {
      alerts.push({
        id: `alert-balance-${sub.id}`,
        type: "low_balance",
        title: "Insufficient Funds Warning",
        message: `An upcoming charge of $${sub.cost.toFixed(2)} for ${sub.name} may exceed your mapped balance of $${balance.toFixed(2)}.`,
        severity: "critical",
        subscriptionId: sub.id
      });
    }
  });

  return alerts;
};
