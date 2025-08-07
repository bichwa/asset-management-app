import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, User, Monitor, Smartphone, HardDrive, ArrowRightLeft, Download, FileUp, UserX, LogOut, Eye, Lock, FileSpreadsheet, History, Database, Cloud, Wifi, WifiOff, Settings } from 'lucide-react';
import * as XLSX from 'xlsx';
import { createClient } from '@supabase/supabase-js';

// Supabase Configuration
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || 'https://dtawcnyzmrvccioikbqcz.supabase.co';
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0YXdjbnl6bXJ2Y2Npb2ticWN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI2MzI2MTQsImV4cCI6MjA0ODIwODYxNH0.u3EB-NLxwRVyKGMW-5BZsLvU7QLIgSCJ-xWHEokvWbU';

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Mock data for demo purposes
const getMockData = (table, operation, data, filters) => {
  const mockAssets = [
    { 
      id: 1, 
      custodian: 'Trish Syokau', 
      serial_number: 'D61F4M2', 
      specifications: 'Dell XPS 13', 
      category: 'Laptop', 
      status: 'Active', 
      price: 86000, 
      previous_owner: '',
      transfer_history: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    { 
      id: 2, 
      custodian: 'Sharon Wala', 
      serial_number: '5CG720103X', 
      specifications: 'HP EliteBook x360 1030 G2', 
      category: 'Laptop', 
      status: 'Active', 
      price: 82000, 
      previous_owner: 'Cynthia Mumbi',
      transfer_history: [
        { from: 'Cynthia Mumbi', to: 'Sharon Wala', date: '2024-01-15', reason: 'Department transfer', transferredBy: 'Administrator' }
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    { 
      id: 3, 
      custodian: 'Jackie Maina', 
      serial_number: '5CG726102X', 
      specifications: 'HP-ENVY', 
      category: 'Laptop', 
      status: 'Active', 
      price: 110000, 
      previous_owner: '',
      transfer_history: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    { 
      id: 4, 
      custodian: 'Francis Kanja', 
      serial_number: 'G2QG632KVT', 
      specifications: 'MacBook Pro 16" 18 GB RAM 512 GB', 
      category: 'Laptop', 
      status: 'Active', 
      price: 300000, 
      previous_owner: '',
      transfer_history: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    { 
      id: 5, 
      custodian: 'Eric', 
      serial_number: '5CG726102X', 
      specifications: 'HP-ENVY', 
      category: 'Laptop', 
      status: 'Returned', 
      price: 86000, 
      previous_owner: '',
      transfer_history: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  switch (operation) {
    case 'select':
      return Promise.resolve({ data: mockAssets, error: null });
    case 'insert':
      const newAsset = { ...data, id: Date.now(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
      return Promise.resolve({ data: [newAsset], error: null });
    case 'update':
      return Promise.resolve({ data: [{ ...data, updated_at: new Date().toISOString() }], error: null });
    case 'delete':
      return Promise.resolve({ data: null, error: null });
    default:
      return Promise.resolve({ data: [], error: null });
  }
};

function App() {
  const [dbStatus, setDbStatus] = useState('initializing');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [supabaseConfig, setSupabaseConfig] = useState({
    url: SUPABASE_URL,
    key: SUPABASE_ANON_KEY
  });
  const [isSupabaseConfigured, setIsSupabaseConfigured] = useState(true);
  
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

  const [assets, setAssets] = useState([]);
  const [filteredAssets, setFilteredAssets] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferAsset, setTransferAsset] = useState(null);
  const [showEmployeeExitModal, setShowEmployeeExitModal] = useState(false);
  const [exitingEmployee, setExitingEmployee] = useState('');
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedAssetHistory, setSelectedAssetHistory] = useState(null);

  const categories = ['All', 'Laptop', 'Phone', 'Monitor', 'Peripheral', 'Other'];
  const statuses = ['All', 'Active', 'Returned', 'Dead', 'Under Repair'];

  const [newAsset, setNewAsset] = useState({
    custodian: '',
    serial_number: '',
    specifications: '',
    category: 'Laptop',
    status: 'Active',
    price: '',
    previous_owner: ''
  });

  const [transferData, setTransferData] = useState({
    newCustodian: '',
    transferDate: new Date().toISOString().split('T')[0],
    reason: '',
    notes: ''
  });

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Initialize Supabase connection
  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        setDbStatus('connecting');
        
        // Try to fetch assets from Supabase
        const { data, error } = await supabase.from('assets').select('*');
        
        if (error) {
          console.error('Supabase error:', error);
          // Fall back to demo mode with mock data
          setDbStatus('demo_mode');
          setIsSupabaseConfigured(false);
          const mockResult = await getMockData('assets', 'select');
          const formattedAssets = mockResult.data.map(asset => ({
            id: asset.id,
            custodian: asset.custodian,
            serialNumber: asset.serial_number,
            specs: asset.specifications,
            category: asset.category,
            status: asset.status,
            price: asset.price,
            previousOwner: asset.previous_owner,
            transferHistory: asset.transfer_history || [],
            createdAt: asset.created_at,
            updatedAt: asset.updated_at
          }));
          setAssets(formattedAssets);
          return;
        }

        // Successfully connected to Supabase
        const formattedAssets = data.map(asset => ({
          id: asset.id,
          custodian: asset.custodian,
          serialNumber: asset.serial_number,
          specs: asset.specifications,
          category: asset.category,
          status: asset.status,
          price: asset.price,
          previousOwner: asset.previous_owner,
          transferHistory: asset.transfer_history || [],
          createdAt: asset.created_at,
          updatedAt: asset.updated_at
        }));
        
        setAssets(formattedAssets);
        setDbStatus('connected');
        setIsSupabaseConfigured(true);
      } catch (error) {
        console.error('Database connection failed:', error);
        setDbStatus('error');
        setIsSupabaseConfigured(false);
        // Load mock data as fallback
        const mockResult = await getMockData('assets', 'select');
        const formattedAssets = mockResult.data.map(asset => ({
          id: asset.id,
          custodian: asset.custodian,
          serialNumber: asset.serial_number,
          specs: asset.specifications,
          category: asset.category,
          status: asset.status,
          price: asset.price,
          previousOwner: asset.previous_owner,
          transferHistory: asset.transfer_history || [],
          createdAt: asset.created_at,
          updatedAt: asset.updated_at
        }));
        setAssets(formattedAssets);
      }
    };

    initializeDatabase();
  }, []);

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
        asset.specs.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (asset.previousOwner && asset.previousOwner.toLowerCase().includes(searchTerm.toLowerCase()))
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

  const handleAddAsset = async () => {
    if (!hasPermission('edit')) {
      alert('You do not have permission to add assets.');
      return;
    }
    
    if (newAsset.custodian && newAsset.serial_number && newAsset.specifications) {
      const assetData = {
        custodian: newAsset.custodian,
        serial_number: newAsset.serial_number,
        specifications: newAsset.specifications,
        category: newAsset.category,
        status: newAsset.status,
        price: parseFloat(newAsset.price) || 0,
        previous_owner: newAsset.previous_owner,
        transfer_history: []
      };
      
      try {
        let result;
        if (isSupabaseConfigured) {
          const { data, error } = await supabase.from('assets').insert([assetData]).select();
          if (error) throw error;
          result = data;
        } else {
          const mockResult = await getMockData('assets', 'insert', assetData);
          result = mockResult.data;
        }
        
        const newAssetFormatted = {
          id: result[0].id,
          custodian: result[0].custodian,
          serialNumber: result[0].serial_number,
          specs: result[0].specifications,
          category: result[0].category,
          status: result[0].status,
          price: result[0].price,
          previousOwner: result[0].previous_owner,
          transferHistory: result[0].transfer_history || [],
          createdAt: result[0].created_at,
          updatedAt: result[0].updated_at
        };
        
        setAssets([...assets, newAssetFormatted]);
        setNewAsset({
          custodian: '',
          serial_number: '',
          specifications: '',
          category: 'Laptop',
          status: 'Active',
          price: '',
          previous_owner: ''
        });
        setShowAddForm(false);
        alert(`Asset added successfully ${isSupabaseConfigured ? 'to Supabase database' : 'in demo mode'}!`);
      } catch (error) {
        console.error('Error adding asset:', error);
        alert('Failed to add asset to database. Please try again.');
      }
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

  const handleUpdateAsset = async () => {
    if (!hasPermission('edit')) return;
    
    if (editingAsset) {
      const updateData = {
        custodian: editingAsset.custodian,
        serial_number: editingAsset.serialNumber,
        specifications: editingAsset.specs,
        category: editingAsset.category,
        status: editingAsset.status,
        price: editingAsset.price,
        previous_owner: editingAsset.previousOwner,
        transfer_history: editingAsset.transferHistory,
        updated_at: new Date().toISOString()
      };
      
      try {
        let result;
        if (isSupabaseConfigured) {
          const { data, error } = await supabase
            .from('assets')
            .update(updateData)
            .eq('id', editingAsset.id)
            .select();
          if (error) throw error;
          result = data;
        } else {
          const mockResult = await getMockData('assets', 'update', {...updateData, id: editingAsset.id});
          result = mockResult.data;
        }
        
        const updatedAssetFormatted = {
          id: result[0].id || editingAsset.id,
          custodian: result[0].custodian,
          serialNumber: result[0].serial_number,
          specs: result[0].specifications,
          category: result[0].category,
          status: result[0].status,
          price: result[0].price,
          previousOwner: result[0].previous_owner,
          transferHistory: result[0].transfer_history || [],
          createdAt: result[0].created_at || editingAsset.createdAt,
          updatedAt: result[0].updated_at
        };
        
        setAssets(assets.map(asset => 
          asset.id === editingAsset.id ? updatedAssetFormatted : asset
        ));
        setEditingAsset(null);
        alert(`Asset updated successfully ${isSupabaseConfigured ? 'in Supabase database' : 'in demo mode'}!`);
      } catch (error) {
        console.error('Error updating asset:', error);
        alert('Failed to update asset in database. Please try again.');
      }
    }
  };

  const handleDeleteAsset = async (id) => {
    if (!hasPermission('edit')) {
      alert('You do not have permission to delete assets.');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this asset? This action cannot be undone.')) {
      try {
        if (isSupabaseConfigured) {
          const { error } = await supabase.from('assets').delete().eq('id', id);
          if (error) throw error;
        } else {
          await getMockData('assets', 'delete', id);
        }
        
        setAssets(assets.filter(asset => asset.id !== id));
        alert(`Asset deleted successfully ${isSupabaseConfigured ? 'from Supabase database' : 'in demo mode'}!`);
      } catch (error) {
        console.error('Error deleting asset:', error);
        alert('Failed to delete asset from database. Please try again.');
      }
    }
  };

  const handleTransferAsset = async () => {
    if (!hasPermission('edit')) return;
    
    if (transferAsset && transferData.newCustodian) {
      // Create transfer history entry
      const transferEntry = {
        from: transferAsset.custodian,
        to: transferData.newCustodian,
        date: transferData.transferDate,
        reason: transferData.reason,
        notes: transferData.notes,
        transferredBy: users[currentUser].name,
        timestamp: new Date().toISOString()
      };

      const updateData = {
        custodian: transferData.newCustodian,
        serial_number: transferAsset.serialNumber,
        specifications: transferAsset.specs,
        category: transferAsset.category,
        status: 'Active',
        price: transferAsset.price,
        previous_owner: transferAsset.custodian,
        transfer_history: [...(transferAsset.transferHistory || []), transferEntry],
        updated_at: new Date().toISOString()
      };
      
      try {
        let result;
        if (isSupabaseConfigured) {
          const { data, error } = await supabase
            .from('assets')
            .update(updateData)
            .eq('id', transferAsset.id)
            .select();
          if (error) throw error;
          result = data;
        } else {
          const mockResult = await getMockData('assets', 'update', {...updateData, id: transferAsset.id});
          result = mockResult.data;
        }
        
        const updatedAssetFormatted = {
          id: result[0].id || transferAsset.id,
          custodian: result[0].custodian,
          serialNumber: result[0].serial_number,
          specs: result[0].specifications,
          category: result[0].category,
          status: result[0].status,
          price: result[0].price,
          previousOwner: result[0].previous_owner,
          transferHistory: result[0].transfer_history || [],
          createdAt: result[0].created_at || transferAsset.createdAt,
          updatedAt: result[0].updated_at
        };
        
        setAssets(assets.map(asset => 
          asset.id === transferAsset.id ? updatedAssetFormatted : asset
        ));
        
        setShowTransferModal(false);
        setTransferAsset(null);
        setTransferData({
          newCustodian: '',
          transferDate: new Date().toISOString().split('T')[0],
          reason: '',
          notes: ''
        });
        alert(`Asset transferred successfully ${isSupabaseConfigured ? 'and saved to Supabase database' : 'in demo mode'}!`);
      } catch (error) {
        console.error('Error transferring asset:', error);
        alert('Failed to transfer asset in database. Please try again.');
      }
    } else {
      alert('Please enter the new custodian name');
    }
  };

  const handleEmployeeExit = async () => {
    if (!hasPermission('edit')) return;
    
    if (exitingEmployee) {
      const updatedAssets = [];
      
      for (const asset of assets) {
        if (asset.custodian === exitingEmployee && asset.status === 'Active') {
          const transferEntry = {
            from: asset.custodian,
            to: 'IT Department',
            date: new Date().toISOString().split('T')[0],
            reason: 'Employee Exit',
            notes: 'Asset returned due to employee departure',
            transferredBy: users[currentUser].name,
            timestamp: new Date().toISOString()
          };

          const updateData = {
            id: asset.id,
            custodian: asset.custodian,
            serial_number: asset.serialNumber,
            specifications: asset.specs,
            category: asset.category,
            status: 'Returned',
            price: asset.price,
            previous_owner: asset.previousOwner,
            transfer_history: [...(asset.transferHistory || []), transferEntry]
          };
          
          try {
            let result;
            if (isSupabaseConfigured) {
              const { data, error } = await supabase
                .from('assets')
                .update(updateData)
                .eq('id', asset.id)
                .select();
              if (error) throw error;
              result = data;
            } else {
              const mockResult = await getMockData('assets', 'update', {...updateData, id: asset.id});
              result = mockResult.data;
            }
            
            updatedAssets.push({
              id: result[0].id || asset.id,
              custodian: result[0].custodian,
              serialNumber: result[0].serial_number,
              specs: result[0].specifications,
              category: result[0].category,
              status: result[0].status,
              price: result[0].price,
              previousOwner: result[0].previous_owner,
              transferHistory: result[0].transfer_history || [],
              createdAt: result[0].created_at || asset.createdAt,
              updatedAt: result[0].updated_at
            });
          } catch (error) {
            console.error('Error updating asset:', error);
            updatedAssets.push(asset); // Keep original if update fails
          }
        } else {
          updatedAssets.push(asset);
        }
      }
      
      setAssets(updatedAssets);
      setShowEmployeeExitModal(false);
      setExitingEmployee('');
      alert(`All assets from ${exitingEmployee} have been marked as returned ${isSupabaseConfigured ? 'and saved to Supabase database' : 'in demo mode'}.`);
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

  const viewAssetHistory = (asset) => {
    setSelectedAssetHistory(asset);
    setShowHistoryModal(true);
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
        'Previous Owner': asset.previousOwner || '',
        'Created Date': asset.createdAt ? new Date(asset.createdAt).toLocaleDateString() : '',
        'Last Updated': asset.updatedAt ? new Date(asset.updatedAt).toLocaleDateString() : '',
        'Transfer History': asset.transferHistory ? 
          asset.transferHistory.map(h => `${h.from} → ${h.to} (${h.date})`).join('; ') : ''
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);
      
      const colWidths = [
        { wch: 20 }, { wch: 15 }, { wch: 30 }, { wch: 12 },
        { wch: 12 }, { wch: 15 }, { wch: 20 }, { wch: 12 }, { wch: 12 }, { wch: 40 }
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
      const headers = 'Custodian,Serial Number,Specs,Category,Status,Price (KES),Previous Owner,Created Date,Last Updated,Transfer History\n';
      
      const rows = filteredAssets.map(asset => {
        const transferHistory = asset.transferHistory ? 
          asset.transferHistory.map(h => `${h.from} → ${h.to} (${h.date})`).join('; ') : '';
        
        return [
          asset.custodian || '',
          asset.serialNumber || '',
          (asset.specs || '').replace(/,/g, ';'),
          asset.category || '',
          asset.status || '',
          asset.price || 0,
          asset.previousOwner || '',
          asset.createdAt ? new Date(asset.createdAt).toLocaleDateString() : '',
          asset.updatedAt ? new Date(asset.updatedAt).toLocaleDateString() : '',
          transferHistory.replace(/,/g, ';')
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
    
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      if (file.name.endsWith('.csv')) {
        const reader = new FileReader();
        reader.onload = async (event) => {
          try {
            const text = event.target.result;
            const lines = text.split('\n').filter(line => line.trim());
            
            if (lines.length < 2) {
              alert('CSV file appears to be empty or invalid.');
              return;
            }
            
            const importedAssets = [];
            for (let i = 1; i < lines.length; i++) {
              const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
              if (values.length >= 3 && values[0] && values[1]) {
                const assetData = {
                  custodian: values[0] || 'Unknown',
                  serial_number: values[1] || `IMPORT-${Date.now()}-${i}`,
                  specifications: values[2] || 'Imported Asset',
                  category: values[3] || 'Other',
                  status: values[4] || 'Active',
                  price: parseFloat(values[5]) || 0,
                  previous_owner: values[6] || '',
                  transfer_history: []
                };
                
                try {
                  let result;
                  if (isSupabaseConfigured) {
                    const { data, error } = await supabase.from('assets').insert([assetData]).select();
                    if (error) throw error;
                    result = data;
                  } else {
                    const mockResult = await getMockData('assets', 'insert', assetData);
                    result = mockResult.data;
                  }
                  
                  importedAssets.push({
                    id: result[0].id,
                    custodian: result[0].custodian,
                    serialNumber: result[0].serial_number,
                    specs: result[0].specifications,
                    category: result[0].category,
                    status: result[0].status,
                    price: result[0].price,
                    previousOwner: result[0].previous_owner,
                    transferHistory: result[0].transfer_history || [],
                    createdAt: result[0].created_at,
                    updatedAt: result[0].updated_at
                  });
                } catch (error) {
                  console.error('Error importing asset:', error);
                }
              }
            }
            
            if (importedAssets.length > 0) {
              setAssets([...assets, ...importedAssets]);
              alert(`Successfully imported ${importedAssets.length} assets ${isSupabaseConfigured ? 'to Supabase database' : 'in demo mode'}!`);
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
        reader.onload = async (event) => {
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
            
            const importedAssets = [];
            for (const [index, row] of jsonData.entries()) {
              if (row.Custodian && row['Serial Number']) {
                const assetData = {
                  custodian: row.Custodian || 'Unknown',
                  serial_number: row['Serial Number'] || `IMPORT-${Date.now()}-${index}`,
                  specifications: row.Specifications || row.Specs || 'Imported Asset',
                  category: row.Category || 'Other',
                  status: row.Status || 'Active',
                  price: parseFloat(row['Price (KES)'] || row.Price) || 0,
                  previous_owner: row['Previous Owner'] || '',
                  transfer_history: []
                };
                
                try {
                  let result;
                  if (isSupabaseConfigured) {
                    const { data, error } = await supabase.from('assets').insert([assetData]).select();
                    if (error) throw error;
                    result = data;
                  } else {
                    const mockResult = await getMockData('assets', 'insert', assetData);
                    result = mockResult.data;
                  }
                  
                  importedAssets.push({
                    id: result[0].id,
                    custodian: result[0].custodian,
                    serialNumber: result[0].serial_number,
                    specs: result[0].specifications,
                    category: result[0].category,
                    status: result[0].status,
                    price: result[0].price,
                    previousOwner: result[0].previous_owner,
                    transferHistory: result[0].transfer_history || [],
                    createdAt: result[0].created_at,
                    updatedAt: result[0].updated_at
                  });
                } catch (error) {
                  console.error('Error importing asset:', error);
                }
              }
            }
            
            if (importedAssets.length > 0) {
              setAssets([...assets, ...importedAssets]);
              alert(`Successfully imported ${importedAssets.length} assets ${isSupabaseConfigured ? 'to Supabase database' : 'in demo mode'}!`);
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

  const getDbStatusIcon = () => {
    if (!isOnline) return <WifiOff className="w-4 h-4 text-red-600" />;
    
    switch (dbStatus) {
      case 'connected':
        return <Cloud className="w-4 h-4 text-green-600" />;
      case 'demo_mode':
        return <Database className="w-4 h-4 text-orange-600" />;
      case 'connecting':
        return <Wifi className="w-4 h-4 text-blue-600 animate-pulse" />;
      case 'error':
        return <WifiOff className="w-4 h-4 text-red-600" />;
      default:
        return <Database className="w-4 h-4 text-gray-600" />;
    }
  };

  const getDbStatusText = () => {
    if (!isOnline) return 'Offline';
    
    switch (dbStatus) {
      case 'connected':
        return 'Supabase Connected';
      case 'demo_mode':
        return 'Demo Mode';
      case 'connecting':
        return 'Connecting...';
      case 'error':
        return 'Connection Error';
      default:
        return 'Initializing...';
    }
  };

  const totalValue = filteredAssets.reduce((sum, asset) => sum + asset.price, 0);

  // Show loading screen while initializing database
  if (dbStatus === 'initializing' || dbStatus === 'connecting') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <Cloud className="w-16 h-16 text-cyan-600 animate-pulse" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Connecting to Supabase</h2>
          <p className="text-gray-600">Establishing database connection...</p>
          {!isSupabaseConfigured && (
            <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-sm text-orange-700">Running in demo mode - configure Supabase to enable cloud database</p>
            </div>
          )}
        </div>
      </div>
    );
  }

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
            <div className="flex items-center justify-center mt-2 text-xs">
              {getDbStatusIcon()}
              <span className={`ml-1 ${dbStatus === 'connected' ? 'text-green-600' : dbStatus === 'demo_mode' ? 'text-orange-600' : 'text-red-600'}`}>
                {getDbStatusText()}
              </span>
            </div>
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

            {dbStatus === 'demo_mode' && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-orange-800">Demo Mode Active</h3>
                  <button
                    onClick={() => setShowSetupModal(true)}
                    className="text-xs text-orange-700 hover:text-orange-900 underline"
                  >
                    Setup Supabase
                  </button>
                </div>
                <p className="text-xs text-orange-700">
                  Currently using mock data. Configure Supabase for cloud database functionality.
                </p>
              </div>
            )}

            <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Demo Credentials:</h3>
              <div className="text-xs text-gray-600 space-y-1">
                <p><strong>Admin:</strong> admin / admin123</p>
                <p><strong>HR (View Only):</strong> hr / hr123</p>
              </div>
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
                <div className="flex items-center text-sm text-gray-500">
                  <span>bean.co.ke</span>
                  {getDbStatusIcon()}
                  <span className={`ml-1 ${dbStatus === 'connected' ? 'text-green-600' : dbStatus === 'demo_mode' ? 'text-orange-600' : 'text-red-600'}`}>
                    {getDbStatusText()}
                  </span>
                </div>
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
              {dbStatus === 'demo_mode' && userRole === 'admin' && (
                <button
                  onClick={() => setShowSetupModal(true)}
                  className="flex items-center gap-2 px-3 py-2 text-orange-600 hover:text-orange-800 hover:bg-orange-50 rounded-lg transition-colors"
                  title="Setup Supabase"
                >
                  <Settings className="w-4 h-4" />
                  <span className="hidden sm:inline">Setup DB</span>
                </button>
              )}
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
            <div className="flex items-center mt-2 text-sm">
              {getDbStatusIcon()}
              <span className={`ml-1 ${dbStatus === 'connected' ? 'text-green-600' : dbStatus === 'demo_mode' ? 'text-orange-600' : 'text-red-600'}`}>
                {dbStatus === 'connected' && 'All data synced with Supabase cloud database'}
                {dbStatus === 'demo_mode' && 'Running in demo mode with mock data'}
                {dbStatus === 'error' && 'Database connection error - using cached data'}
              </span>
            </div>
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
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">History</th>
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
                      {asset.previousOwner ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                          {asset.previousOwner}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => viewAssetHistory(asset)}
                        className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors"
                        title="View Transfer History"
                      >
                        <History className="w-3 h-3" />
                        {asset.transferHistory?.length || 0}
                      </button>
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

        {/* Supabase Setup Modal */}
        {showSetupModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-[600px] shadow-lg rounded-xl bg-white border-blue-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="p-2 bg-gradient-to-r from-cyan-100 to-blue-100 rounded-lg mr-3">
                    <Cloud className="w-6 h-6 text-cyan-600" />
                  </div>
                  <h3 className="text-lg font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">Setup Supabase Database</h3>
                </div>
                <button
                  onClick={() => setShowSetupModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-xl"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-800 mb-2">Quick Setup Instructions:</h4>
                  <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                    <li>Go to <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-900">supabase.com</a> and create a free account</li>
                    <li>Create a new project</li>
                    <li>Go to Settings → API in your Supabase dashboard</li>
                    <li>Copy your Project URL and anon public key</li>
                    <li>Run the SQL commands below in your SQL Editor</li>
                    <li>Paste your credentials here</li>
                  </ol>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-800 mb-2">Required SQL Setup:</h4>
                  <pre className="text-xs bg-gray-800 text-green-400 p-3 rounded overflow-x-auto">
{`-- Create assets table
CREATE TABLE assets (
  id BIGSERIAL PRIMARY KEY,
  custodian TEXT NOT NULL,
  serial_number TEXT NOT NULL,
  specifications TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Other',
  status TEXT NOT NULL DEFAULT 'Active',
  price DECIMAL(10,2) DEFAULT 0,
  previous_owner TEXT,
  transfer_history JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (optional)
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (for demo)
CREATE POLICY "Allow all operations" ON assets FOR ALL USING (true);`}
                  </pre>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Supabase Project URL</label>
                    <input
                      type="url"
                      value={supabaseConfig.url}
                      onChange={(e) => setSupabaseConfig({...supabaseConfig, url: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      placeholder="https://your-project.supabase.co"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Supabase Anon Key</label>
                    <input
                      type="password"
                      value={supabaseConfig.key}
                      onChange={(e) => setSupabaseConfig({...supabaseConfig, key: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    />
                  </div>
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <p className="text-sm text-orange-700">
                    <strong>Note:</strong> For production use, store these credentials securely as environment variables. 
                    This demo stores them in the component state for simplicity.
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      // In a real app, you'd store these securely and reinitialize the connection
                      alert('In a real implementation, these credentials would be stored securely and the database connection would be reinitialized. For this demo, please modify the SUPABASE_URL and SUPABASE_ANON_KEY constants in the code.');
                      setShowSetupModal(false);
                    }}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg hover:from-cyan-700 hover:to-blue-700 transition-all duration-200"
                  >
                    Save Configuration
                  </button>
                  <button
                    onClick={() => setShowSetupModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

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
                  value={newAsset.serial_number}
                  onChange={(e) => setNewAsset({...newAsset, serial_number: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
                <input
                  type="text"
                  placeholder="Specifications"
                  value={newAsset.specifications}
                  onChange={(e) => setNewAsset({...newAsset, specifications: e.target.value})}
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
                <input
                  type="text"
                  placeholder="Previous Owner (optional)"
                  value={newAsset.previous_owner}
                  onChange={(e) => setNewAsset({...newAsset, previous_owner: e.target.value})}
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
                <input
                  type="text"
                  placeholder="Previous Owner"
                  value={editingAsset.previousOwner || ''}
                  onChange={(e) => setEditingAsset({...editingAsset, previousOwner: e.target.value})}
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
                <input
                  type="text"
                  placeholder="Reason for transfer"
                  value={transferData.reason}
                  onChange={(e) => setTransferData({...transferData, reason: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <textarea
                  placeholder="Additional notes (optional)"
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

        {/* Transfer History Modal */}
        {showHistoryModal && selectedAssetHistory && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-[600px] shadow-lg rounded-xl bg-white">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="p-2 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg mr-3">
                    <History className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Asset Transfer History</h3>
                </div>
                <button
                  onClick={() => setShowHistoryModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-xl"
                >
                  ×
                </button>
              </div>
              
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="font-medium">{selectedAssetHistory.specs}</p>
                <p className="text-sm text-gray-600">Serial: {selectedAssetHistory.serialNumber}</p>
                <p className="text-sm text-gray-600">Current Custodian: {selectedAssetHistory.custodian}</p>
                {selectedAssetHistory.createdAt && (
                  <p className="text-sm text-gray-600">Created: {new Date(selectedAssetHistory.createdAt).toLocaleDateString()}</p>
                )}
              </div>

              <div className="max-h-96 overflow-y-auto">
                {selectedAssetHistory.transferHistory && selectedAssetHistory.transferHistory.length > 0 ? (
                  <div className="space-y-3">
                    {selectedAssetHistory.transferHistory.map((transfer, index) => (
                      <div key={index} className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50 rounded-r-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-900">
                              {transfer.from} → {transfer.to}
                            </p>
                            <p className="text-sm text-gray-600">{transfer.reason}</p>
                            {transfer.notes && (
                              <p className="text-sm text-gray-500 italic">"{transfer.notes}"</p>
                            )}
                          </div>
                          <div className="text-right text-sm text-gray-500">
                            <p>{transfer.date}</p>
                            <p>by {transfer.transferredBy}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <History className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No transfer history available</p>
                    <p className="text-sm">This asset has not been transferred yet</p>
                  </div>
                )}
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <button
                  onClick={() => setShowHistoryModal(false)}
                  className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Close
                </button>
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
                Select the employee who is leaving. This will mark all their assets as Returned and record the transfer history in the Supabase database.
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