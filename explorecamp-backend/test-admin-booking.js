import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:5000';

// Test admin booking status update
async function testAdminBookingStatusUpdate() {
    try {
        console.log('🧪 Testing Admin Booking Status Update...\n');

        // First, let's get all bookings
        console.log('1. Fetching all bookings...');
        const bookingsResponse = await fetch(`${API_BASE_URL}/admin/bookings`, {
            headers: {
                'Authorization': 'Bearer YOUR_ADMIN_TOKEN_HERE', // Replace with actual admin token
                'Content-Type': 'application/json'
            }
        });

        if (!bookingsResponse.ok) {
            console.error('❌ Failed to fetch bookings:', bookingsResponse.status, bookingsResponse.statusText);
            return;
        }

        const bookings = await bookingsResponse.json();
        console.log(`✅ Found ${bookings.length} bookings`);

        if (bookings.length === 0) {
            console.log('⚠️ No bookings found to test with');
            return;
        }

        // Get the first booking
        const firstBooking = bookings[0];
        console.log(`\n2. Testing with booking ID: ${firstBooking.id}`);
        console.log(`   Current status: ${firstBooking.status}`);
        console.log(`   User: ${firstBooking.user?.name || 'N/A'}`);
        console.log(`   Product: ${firstBooking.product?.name || 'N/A'}`);

        // Test updating status to confirmed
        console.log('\n3. Updating booking status to "confirmed"...');
        const updateResponse = await fetch(`${API_BASE_URL}/admin/bookings/${firstBooking.id}/status`, {
            method: 'PUT',
            headers: {
                'Authorization': 'Bearer YOUR_ADMIN_TOKEN_HERE', // Replace with actual admin token
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: 'confirmed' })
        });

        if (!updateResponse.ok) {
            const errorText = await updateResponse.text();
            console.error('❌ Failed to update booking status:', updateResponse.status, updateResponse.statusText);
            console.error('Error details:', errorText);
            return;
        }

        const updateResult = await updateResponse.json();
        console.log('✅ Booking status updated successfully!');
        console.log('Response:', updateResult);

        // Verify the update by fetching the booking again
        console.log('\n4. Verifying the update...');
        const verifyResponse = await fetch(`${API_BASE_URL}/admin/bookings`, {
            headers: {
                'Authorization': 'Bearer YOUR_ADMIN_TOKEN_HERE', // Replace with actual admin token
                'Content-Type': 'application/json'
            }
        });

        if (verifyResponse.ok) {
            const updatedBookings = await verifyResponse.json();
            const updatedBooking = updatedBookings.find(b => b.id === firstBooking.id);
            if (updatedBooking) {
                console.log(`✅ Verification successful! Booking status is now: ${updatedBooking.status}`);
            } else {
                console.log('⚠️ Could not find updated booking in response');
            }
        }

        console.log('\n🎉 Admin booking status update test completed!');

    } catch (error) {
        console.error('❌ Test failed with error:', error);
    }
}

// Instructions for running the test
console.log('📋 Instructions:');
console.log('1. Make sure your backend server is running on http://localhost:5000');
console.log('2. Replace "YOUR_ADMIN_TOKEN_HERE" with an actual admin JWT token');
console.log('3. Run this script with: node test-admin-booking.js');
console.log('\n');

testAdminBookingStatusUpdate(); 