import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:5000';

// Simple test for booking status update
async function testBookingStatusUpdate() {
    try {
        console.log('🧪 Testing Booking Status Update...\n');

        // First, get all bookings
        console.log('1. Fetching all bookings...');
        const bookingsResponse = await fetch(`${API_BASE_URL}/admin/bookings`);
        
        if (!bookingsResponse.ok) {
            console.error('❌ Failed to fetch bookings:', bookingsResponse.status);
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

        // Test updating status to confirmed
        console.log('\n3. Updating booking status to "confirmed"...');
        const updateResponse = await fetch(`${API_BASE_URL}/admin/bookings/${firstBooking.id}/status`, {
            method: 'PUT',
            headers: {
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

        // Test updating status back to pending
        console.log('\n4. Updating booking status back to "pending"...');
        const updateResponse2 = await fetch(`${API_BASE_URL}/admin/bookings/${firstBooking.id}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: 'pending' })
        });

        if (!updateResponse2.ok) {
            const errorText = await updateResponse2.text();
            console.error('❌ Failed to update booking status back to pending:', updateResponse2.status);
            console.error('Error details:', errorText);
            return;
        }

        const updateResult2 = await updateResponse2.json();
        console.log('✅ Booking status updated back to pending successfully!');
        console.log('Response:', updateResult2);

        console.log('\n🎉 Booking status update test completed successfully!');

    } catch (error) {
        console.error('❌ Test failed with error:', error);
    }
}

console.log('📋 Testing booking status update functionality...\n');
testBookingStatusUpdate(); 