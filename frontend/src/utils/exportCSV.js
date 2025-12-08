export function exportExpensesToCSV(expenses, groupName) {
  // CSV headers
  const headers = ['Date', 'Description', 'Category', 'Amount', 'Paid By', 'Splits'];
  
  // Convert expenses to CSV rows
  const rows = expenses.map(expense => {
    const splits = expense.splits?.map(s => `${s.member_name}: $${parseFloat(s.amount_owed).toFixed(2)}`).join('; ') || '';
    
    return [
      new Date(expense.date).toLocaleDateString(),
      expense.description,
      expense.category,
      `$${parseFloat(expense.amount).toFixed(2)}`,
      expense.paid_by?.name || 'Unknown',
      splits
    ];
  });
  
  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');
  
  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${groupName}_expenses_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportBalancesToCSV(balances, groupName) {
  const headers = ['From', 'To', 'Amount'];
  
  const rows = balances.simplified_debts.map(debt => [
    debt.from_member_name,
    debt.to_member_name,
    `$${debt.amount.toFixed(2)}`
  ]);
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${groupName}_balances_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
