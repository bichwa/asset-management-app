const { createClient } = require('@supabase/supabase-js');

// Test Supabase connection
const SUPABASE_URL = 'https://dtawcnyzmrvcciokbqcz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0YXdjbnl6bXJ2Y2Npb2ticWN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI2MzI2MTQsImV4cCI6MjA0ODIwODYxNH0.u3EB-NLxwRVyKGMW-5BZsLvU7QLIgSCJ-xWHEokvWbU';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testConnection() {
    console.log('Testing Supabase connection...');
    console.log('URL:', SUPABASE_URL);
    console.log('Key:', SUPABASE_ANON_KEY.substring(0, 20) + '...');
    
    try {
        // Test basic connection
        const { data, error } = await supabase.from('assets').select('count', { count: 'exact', head: true });
        
        if (error) {
            console.error('❌ Connection failed:', error.message);
            console.error('Full error:', error);
        } else {
            console.log('✅ Connection successful!');
            console.log('Assets table exists and accessible');
        }
    } catch (err) {
        console.error('❌ Unexpected error:', err.message);
    }
}

testConnection();