import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, User, Monitor, Smartphone, HardDrive, ArrowRightLeft, Download, FileUp, UserX, LogOut, Eye, Lock, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';

function App() {
  // Authentication state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [currentUser, setCurrentUser] = useState('');
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');

  // Sample credentials
  const users = {
    admin: { password: 'admin123', role: 'admin', name: 'Administrator' },
    hr: { password: 'hr123', role: 'hr', name: 'HR Manager' }
  };

  const [assets, setAssets] = useState([
    { id: 1, custodian: 'Trish Syokau', serialNumber: 'D61F4M2', specs: 'Dell XPS 13', category: 'Laptop', status: 'Active', price: 86000, previousOwner: '' },
    { id: 2, custodian: 'Sharon Wala', serialNumber: '5CG720103X', specs: 'HP EliteBook x360 1030 G2', category: 'Laptop', status: 'Active', price: 82000, previousOwner: 'Cynthia Mumbi' },
    { id: 3, custodian: 'Jackie Maina', serialNumber: '5CG726102X', specs: 'HP-ENVY', category: 'Laptop', status: 'Active', price: 110000, previousOwner: '' },
    { id: 4, custodian: 'Francis Kanja', serialNumber: 'G2QG632KVT', specs: 'MacBook Pro 16" 18 GB RAM 512 GB', category: 'Laptop', status: 'Active', price: 300000, previousOwner: '' },
    { id: 5, custodian: 'Eric', serialNumber: '5CG726102X', specs: 'HP-ENVY', category: 'Laptop', status: 'Returned', price: 86000, previousOwner: '' }
  ]);

  const [filteredAssets, setFilteredAssets] = useState(assets);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferAsset, setTransferAsset] = useState(null);
  const [showEmployeeExitModal, setShowEmployeeExitModal] = useState(false);
  const [exitingEmployee, setExitingEmployee] = useState('');

  const categories = ['All', 'Laptop', 'Phone', 'Monitor', 'Peripheral', 'Other'];
  const statuses = ['All', 'Active', 'Returned', 'Dead', 'Under Repair'];

  const [newAsset, setNewAsset] = useState({
    custodian: '',
    serialNumber: '',
    specs: '',
    category: 'Laptop',
    status: 'Active',
    price: '',
    previousOwner: ''
  });

  const [transferData, setTransferData] = useState({
    newCustodian: '',
    transferDate: new Date().toISOString().split('T')[0],
    notes: ''
  });

  // Login function
  const handleLogin = (e) => {
    if (e) e.preventDefault();
    
    if (loginForm.username === 'admin' && loginForm.password === 'admin123') {
      setIsLoggedIn(true);
      setUserRole('admin');
      setCurrentUser('admin');
      setLoginError('');
      return;
    }
    
    if (loginForm.username === 'hr' && loginForm.password === 'hr123') {
      setIsLoggedIn(true);
      setUserRole('hr');
      setCurrentUser('hr');
      setLoginError('');
      return;
    }
    
    setLoginError('Invalid username or password');
  };

  // Quick login functions
  const quickLoginAdmin = () => {
    setIsLoggedIn(true);
    setUserRole('admin');
    setCurrentUser('admin');
    setLoginError('');
    setLoginForm({ username: 'admin', password: 'admin123' });
  };

  const quickLoginHR = () => {
    setIsLoggedIn(true);
    setUserRole('hr');
    setCurrentUser('hr');
    setLoginError('');
    setLoginForm({ username: 'hr', password: 'hr123' });
  };

  // Logout function
  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole('');
    setCurrentUser('');
    setLoginForm({ username: '', password: '' });
    setLoginError('');
  };

  // Check permissions
  const hasPermission = (action) => {
    if (userRole === 'admin') return true;
    if (userRole === 'hr' && action === 'view') return true;
    return false;
  };

  useEffect(() => {
    let filtered = assets;

    if (searchTerm) {
      filtered = filtered.filter(asset =>
        asset.custodian.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.specs.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(asset => asset.category === selectedCategory);
    }

    if (selectedStatus !== 'All') {
      filtered = filtered.filter(asset => asset.status === selectedStatus);
    }

    setFilteredAssets(filtered);
  }, [assets, searchTerm, selectedCategory, selectedStatus]);

  const handleAddAsset = () => {
    if (!hasPermission('edit')) {
      alert('You do not have permission to add assets.');
      return;
    }
    
    if (newAsset.custodian && newAsset.serialNumber && newAsset.specs) {
      const asset = {
        ...newAsset,
        id: Date.now(),
        price: parseFloat(newAsset.price) || 0
      };
      setAssets([...assets, asset]);
      setNewAsset({
        custodian: '',
        serialNumber: '',
        specs: '',
        category: 'Laptop',
        status: 'Active',
        price: '',
        previousOwner: ''
      });
      setShowAddForm(false);
      alert('Asset added successfully!');
    } else {
      alert('Please fill in all required fields');
    }
  };

  const handleEditAsset = (asset) => {
    if (!hasPermission('edit')) {
      alert('You do not have permission to edit assets.');
      return;
    }
    setEditingAsset({ ...asset });
  };

  const handleUpdateAsset = () => {
    if (!hasPermission('edit')) return;
    
    if (editingAsset) {
      setAssets(assets.map(asset => 
        asset.id === editingAsset.id ? editingAsset : asset
      ));
      setEditingAsset(null);
      alert('Asset updated successfully!');
    }
  };

  const handleDeleteAsset = (id) => {
    if (!hasPermission('edit')) {
      alert('You do not have permission to delete assets.');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this asset?')) {
      setAssets(assets.filter(asset => asset.id !== id));
      alert('Asset deleted successfully!');
    }
  };

  const handleTransferAsset = () => {
    if (!hasPermission('edit')) return;
    
    if (transferAsset && transferData.newCustodian) {
      const updatedAsset = {
        ...transferAsset,
        previousOwner: transferAsset.custodian,
        custodian: transferData.newCustodian,
        transferDate: transferData.transferDate,
        status: 'Active'
      };
      
      setAssets(assets.map(asset => 
        asset.id === transferAsset.id ? updatedAsset : asset
      ));
      
      setShowTransferModal(false);
      setTransferAsset(null);
      setTransferData({
        newCustodian: '',
        transferDate: new Date().toISOString().split('T')[0],
        notes: ''
      });
      alert('Asset transferred successfully!');
    } else {
      alert('Please enter the new custodian name');
    }
  };

  const handleEmployeeExit = () => {
    if (!hasPermission('edit')) return;
    
    if (exitingEmployee) {
      const updatedAssets = assets.map(asset => {
        if (asset.custodian === exitingEmployee && asset.status === 'Active') {
          return {
            ...asset,
            status: 'Returned',
            transferDate: new Date().toISOString().split('T')[0]
          };
        }
        return asset;
      });
      
      setAssets(updatedAssets);
      setShowEmployeeExitModal(false);
      setExitingEmployee('');
      alert(`All assets from ${exitingEmployee} have been marked as returned.`);
    }
  };

  const getUniqueEmployees = () => {
    const employees = assets
      .filter(asset => asset.status === 'Active')
      .map(asset => asset.custodian);
    return [...new Set(employees)].sort();
  };

  const getEmployeeAssets = (employeeName) => {
    return assets.filter(asset => asset.custodian === employeeName && asset.status === 'Active');
  };

  // Excel Export Function
  const exportToExcel = () => {
    try {
      const exportData = filteredAssets.map(asset => ({
        'Custodian': asset.custodian || '',
        'Serial Number': asset.serialNumber || '',
        'Specifications': asset.specs || '',
        'Category': asset.category || '',
        'Status': asset.status || '',
        'Price (KES)': asset.price || 0,
        'Previous Owner': asset.previousOwner || ''
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);
      
      const colWidths = [
        { wch: 20 }, { wch: 15 }, { wch: 30 }, { wch: 12 },
        { wch: 12 }, { wch: 15 }, { wch: 20 }
      ];
      ws['!cols'] = colWidths;

      XLSX.utils.book_append_sheet(wb, ws, 'Assets');
      
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
      const filename = `bean-assets-${timestamp}.xlsx`;
      
      XLSX.writeFile(wb, filename);
      alert(`Excel file exported successfully as ${filename}!`);
      
    } catch (error) {
      console.error('Excel export failed:', error);
      alert('Excel export failed. Please try again or contact support.');
    }
  };

  // CSV Export Function
  const exportToCSV = () => {
    try {
      const headers = 'Custodian,Serial Number,Specs,Category,Status,Price (KES),Previous Owner\n';
      
      const rows = filteredAssets.map(asset => {
        return [
          asset.custodian || '',
          asset.serialNumber || '',
          (asset.specs || '').replace(/,/g, ';'),
          asset.category || '',
          asset.status || '',
          asset.price || 0,
          asset.previousOwner || ''
        ].join(',');
      }).join('\n');
      
      const csvData = headers + rows;
      
      const element = document.createElement('a');
      const file = new Blob([csvData], { type: 'text/csv' });
      element.href = URL.createObjectURL(file);
      element.download = `bean-assets-${Date.now()}.csv`;
      element.style.display = 'none';
      
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      
      alert('CSV export completed! Check your Downloads folder.');
      
    } catch (error) {
      console.error('CSV export failed:', error);
      alert('CSV export failed. Please try again.');
    }
  };

  const handleImportClick = () => {
    if (!hasPermission('edit')) {
      alert('You do not have permission to import assets.');
      return;
    }
    
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,.xlsx,.xls';
    input.style.display = 'none';
    
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      if (file.name.endsWith('.csv')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const text = event.target.result;
            const lines = text.split('\n').filter(line => line.trim());
            
            if (lines.length < 2) {
              alert('CSV file appears to be empty or invalid.');
              return;
            }
            
            const importedData = [];
            for (let i = 1; i < lines.length; i++) {
              const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
              if (values.length >= 3 && values[0] && values[1]) {
                const asset = {
                  id: Date.now() + i,
                  custodian: values[0] || 'Unknown',
                  serialNumber: values[1] || `IMPORT-${Date.now()}-${i}`,
                  specs: values[2] || 'Imported Asset',
                  category: values[3] || 'Other',
                  status: values[4] || 'Active',
                  price: parseFloat(values[5]) || 0,
                  previousOwner: values[6] || ''
                };
                importedData.push(asset);
              }
            }
            
            if (importedData.length > 0) {
              setAssets([...assets, ...importedData]);
              alert(`Successfully imported ${importedData.length} assets from CSV!`);
            } else {
              alert('No valid asset data found in the CSV file.');
            }
          } catch (error) {
            console.error('CSV import error:', error);
            alert('Error reading CSV file: ' + error.message);
          }
        };
        reader.readAsText(file);
      } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const data = new Uint8Array(event.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);
            
            if (jsonData.length === 0) {
              alert('Excel file appears to be empty or invalid.');
              return;
            }
            
            const importedData = [];
            jsonData.forEach((row, index) => {
              if (row.Custodian && row['Serial Number']) {
                const asset = {
                  id: Date.now() + index,
                  custodian: row.Custodian || 'Unknown',
                  serialNumber: row['Serial Number'] || `IMPORT-${Date.now()}-${index}`,
                  specs: row.Specifications || row.Specs || 'Imported Asset',
                  category: row.Category || 'Other',
                  status: row.Status || 'Active',
                  price: parseFloat(row['Price (KES)'] || row.Price) || 0,
                  previousOwner: row['Previous Owner'] || ''
                };
                importedData.push(asset);
              }
            });
            
            if (importedData.length > 0) {
              setAssets([...assets, ...importedData]);
              alert(`Successfully imported ${importedData.length} assets from Excel file!`);
            } else {
              alert('No valid asset data found in the Excel file.');
            }
          } catch (error) {
            console.error('Excel import error:', error);
            alert('Error reading Excel file: ' + error.message);
          }
        };
        reader.readAsArrayBuffer(file);
      } else {
        alert('Please select a valid CSV or Excel file.');
      }
    };
    
    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Laptop': return <Monitor className="w-4 h-4" />;
      case 'Phone': return <Smartphone className="w-4 h-4" />;
      default: return <HardDrive className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'text-green-600 bg-green-100';
      case 'Returned': return 'text-blue-600 bg-blue-100';
      case 'Dead': return 'text-red-600 bg-red-100';
      case 'Under Repair': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const totalValue = filteredAssets.reduce((sum, asset) => sum + asset.price, 0);

  // Login Screen
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md border border-blue-100">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
                  <div className="w-6 h-6 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"></div>
                </div>
              </div>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
              bean
            </h1>
            <p className="text-gray-500 -mt-1">interactive</p>
            <p className="text-sm text-gray-600 mt-2">IT Asset Management System</p>
          </div>

          <div className="space-y-6">
            <form onSubmit={handleLogin}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                  <input
                    type="text"
                    value={loginForm.username}
                    onChange={(e) => setLoginForm({...loginForm, username: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="Enter username (admin or hr)"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <input
                    type="password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="Enter password"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg hover:from-cyan-700 hover:to-blue-700 transition-all duration-200 shadow-sm"
                >
                  Sign In
                </button>
              </div>
            </form>

            {loginError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600">{loginError}</p>
              </div>
            )}

            <div className="space-y-2">
              <p className="text-sm text-gray-600 text-center">Quick Access:</p>
              <button
                onClick={quickLoginAdmin}
                className="w-full px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
              >
                🔓 Login as Admin (Full Access)
              </button>
              <button
                onClick={quickLoginHR}
                className="w-full px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
              >
                👁️ Login as HR (View Only)
              </button>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Demo Credentials:</h3>
            <div className="text-xs text-gray-600 space-y-1">
              <p><strong>Admin:</strong> admin / admin123</p>
              <p><strong>HR (View Only):</strong> hr / hr123</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main Application
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                      <div className="w-4 h-4 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"></div>
                    </div>
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                    bean
                  </h1>
                  <p className="text-sm text-gray-500 -mt-1">interactive</p>
                </div>
              </div>
              <div className="hidden md:block h-8 w-px bg-gray-300"></div>
              <div className="hidden md:block">
                <h2 className="text-lg font-semibold text-gray-800">IT Asset Management</h2>
                <p className="text-sm text-gray-500">bean.co.ke</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">
                  {users[currentUser].name}
                  {userRole === 'hr' && (
                    <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                      <Eye className="w-3 h-3 mr-1" />
                      View Only
                    </span>
                  )}
                  {userRole === 'admin' && (
                    <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                      <Lock className="w-3 h-3 mr-1" />
                      Full Access
                    </span>
                  )}
                </p>
                <p className="text-xs text-cyan-600 font-medium">Asset Management System</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Dashboard Header */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-blue-100">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-2">
              IT Asset Management Dashboard
            </h1>
            <p className="text-gray-600">
              Track and manage company IT assets, assignments, and transfers
              {userRole === 'hr' && (
                <span className="ml-2 text-blue-600 font-medium">(View Only Mode)</span>
              )}
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-blue-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Assets</p>
                <p className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">{filteredAssets.length}</p>
              </div>
              <div className="p-3 bg-gradient-to-r from-cyan-100 to-blue-100 rounded-lg">
                <Monitor className="h-6 w-6 text-cyan-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-green-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Assets</p>
                <p className="text-2xl font-bold text-green-600">{filteredAssets.filter(a => a.status === 'Active').length}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <User className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-purple-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-purple-600">KES {totalValue.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <HardDrive className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-orange-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Available Assets</p>
                <p className="text-2xl font-bold text-orange-600">{filteredAssets.filter(a => a.status === 'Returned').length}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <ArrowRightLeft className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-sm mb-6 p-6 border border-blue-100">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search assets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent w-full sm:w-64"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              >
                {statuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2 flex-wrap">
              {hasPermission('edit') && (
                <>
                  <button
                    onClick={handleImportClick}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg hover:from-cyan-700 hover:to-blue-700 transition-all duration-200 shadow-sm"
                  >
                    <FileUp className="w-4 h-4" />
                    Import Excel
                  </button>
                  <button
                    onClick={() => setShowEmployeeExitModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors shadow-sm"
                  >
                    <UserX className="w-4 h-4" />
                    Employee Exit
                  </button>
                </>
              )}
              
              {/* Export Dropdown */}
              <div className="relative group">
                <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm">
                  <Download className="w-4 h-4" />
                  Export
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                  <div className="py-1">
                    <button
                      onClick={exportToExcel}
                      className="flex items-center gap-2 w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-green-600" />
                      Export to Excel (.xlsx)
                    </button>
                    <button
                      onClick={exportToCSV}
                      className="flex items-center gap-2 w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <Download className="w-4 h-4 text-blue-600" />
                      Export to CSV (.csv)
                    </button>
                  </div>
                </div>
              </div>
              
              {hasPermission('edit') && (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add Asset
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Assets Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-blue-100">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-cyan-50 to-blue-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Custodian</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Serial Number</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Specifications</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Price (KES)</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Previous Owner</th>
                  {hasPermission('edit') && (
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredAssets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900">{asset.custodian}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                      {asset.serialNumber}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                      {asset.specs}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getCategoryIcon(asset.category)}
                        <span className="ml-2 text-sm text-gray-900">{asset.category}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(asset.status)}`}>
                        {asset.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {asset.price.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {asset.previousOwner || '-'}
                    </td>
                    {hasPermission('edit') && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setTransferAsset(asset);
                              setShowTransferModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                            title="Transfer Asset"
                          >
                            <ArrowRightLeft className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditAsset(asset)}
                            className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50"
                            title="Edit Asset"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteAsset(asset.id)}
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                            title="Delete Asset"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Asset Modal */}
        {showAddForm && hasPermission('edit') && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-xl bg-white border-blue-100">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-gradient-to-r from-cyan-100 to-blue-100 rounded-lg mr-3">
                  <Plus className="w-6 h-6 text-cyan-600" />
                </div>
                <h3 className="text-lg font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">Add New Asset</h3>
              </div>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Custodian Name"
                  value={newAsset.custodian}
                  onChange={(e) => setNewAsset({...newAsset, custodian: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
                <input
                  type="text"
                  placeholder="Serial Number"
                  value={newAsset.serialNumber}
                  onChange={(e) => setNewAsset({...newAsset, serialNumber: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
                <input
                  type="text"
                  placeholder="Specifications"
                  value={newAsset.specs}
                  onChange={(e) => setNewAsset({...newAsset, specs: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
                <select
                  value={newAsset.category}
                  onChange={(e) => setNewAsset({...newAsset, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                >
                  {categories.slice(1).map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="Price (KES)"
                  value={newAsset.price}
                  onChange={(e) => setNewAsset({...newAsset, price: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleAddAsset}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg hover:from-cyan-700 hover:to-blue-700 transition-all duration-200"
                  >
                    Add Asset
                  </button>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Asset Modal */}
        {editingAsset && hasPermission('edit') && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-xl bg-white border-blue-100">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-lg mr-3">
                  <Edit2 className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="text-lg font-bold text-indigo-600">Edit Asset</h3>
              </div>
              <div className="space-y-4">
                <input
                  type="text"
                  value={editingAsset.custodian}
                  onChange={(e) => setEditingAsset({...editingAsset, custodian: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  type="text"
                  value={editingAsset.serialNumber}
                  onChange={(e) => setEditingAsset({...editingAsset, serialNumber: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  type="text"
                  value={editingAsset.specs}
                  onChange={(e) => setEditingAsset({...editingAsset, specs: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
                <select
                  value={editingAsset.status}
                  onChange={(e) => setEditingAsset({...editingAsset, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  {statuses.slice(1).map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
                <input
                  type="number"
                  value={editingAsset.price}
                  onChange={(e) => setEditingAsset({...editingAsset, price: parseFloat(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleUpdateAsset}
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    Update Asset
                  </button>
                  <button
                    onClick={() => setEditingAsset(null)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Transfer Asset Modal */}
        {showTransferModal && transferAsset && hasPermission('edit') && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-xl bg-white">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Transfer Asset</h3>
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Transferring:</p>
                <p className="font-medium">{transferAsset.specs}</p>
                <p className="text-sm text-gray-600">From: {transferAsset.custodian}</p>
              </div>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="New Custodian Name"
                  value={transferData.newCustodian}
                  onChange={(e) => setTransferData({...transferData, newCustodian: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="date"
                  value={transferData.transferDate}
                  onChange={(e) => setTransferData({...transferData, transferDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <textarea
                  placeholder="Transfer notes (optional)"
                  value={transferData.notes}
                  onChange={(e) => setTransferData({...transferData, notes: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleTransferAsset}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Transfer Asset
                  </button>
                  <button
                    onClick={() => {
                      setShowTransferModal(false);
                      setTransferAsset(null);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Employee Exit Modal */}
        {showEmployeeExitModal && hasPermission('edit') && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-xl bg-white border-orange-100">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-orange-100 rounded-lg mr-3">
                  <UserX className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-lg font-bold text-orange-600">Employee Exit Process</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Select the employee who is leaving. This will mark all their assets as Returned.
              </p>
              <div className="space-y-4">
                <select
                  value={exitingEmployee}
                  onChange={(e) => setExitingEmployee(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Select Employee</option>
                  {getUniqueEmployees().map(employee => (
                    <option key={employee} value={employee}>
                      {employee} ({getEmployeeAssets(employee).length} assets)
                    </option>
                  ))}
                </select>
                
                {exitingEmployee && (
                  <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <p className="text-sm font-medium text-orange-800 mb-2">Assets to be returned:</p>
                    <ul className="text-xs text-orange-700 space-y-1">
                      {getEmployeeAssets(exitingEmployee).map(asset => (
                        <li key={asset.id}>• {asset.specs} ({asset.serialNumber})</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div className="flex gap-2">
                  <button
                    onClick={handleEmployeeExit}
                    disabled={!exitingEmployee}
                    className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Process Exit
                  </button>
                  <button
                    onClick={() => {
                      setShowEmployeeExitModal(false);
                      setExitingEmployee('');
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;