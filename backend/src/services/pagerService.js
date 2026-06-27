// Serwis do komunikacji z pagerami IoT
// Implementacja komunikacji z ESP32 przez WiFi/Bluetooth

/**
 * Powiadamia pager o zmianie statusu zamówienia
 * @param {string} pagerNumber - Numer pagera
 * @param {string} orderNumber - Numer zamówienia
 * @param {string} status - Status zamówienia (pending, preparing, ready, completed)
 */
const notifyPager = async (pagerNumber, orderNumber, status = 'ready') => {
  try {
    console.log(`📟 Powiadamianie pagera ${pagerNumber} o zamówieniu ${orderNumber} (${status})`);

    // Wysłanie powiadomienia do ESP32 przez WebSocket
    if (global.wss) {
      const message = JSON.stringify({
        type: 'orderUpdate',
        status: status,
        orderNumber: orderNumber,
        pagerNumber: pagerNumber,
        timestamp: new Date().toISOString()
      });

      let sentCount = 0;
      global.wss.clients.forEach(client => {
        if (client.readyState === 1) { // WebSocket.OPEN
          client.send(message);
          sentCount++;
        }
      });

      console.log(`✅ Powiadomienie wysłane do ${sentCount} klientów WebSocket`);

      return {
        success: true,
        pagerNumber,
        orderNumber,
        clientsNotified: sentCount,
        timestamp: new Date()
      };
    } else {
      console.warn('⚠️ WebSocket server nie jest dostępny');
      return {
        success: false,
        error: 'WebSocket server niedostępny'
      };
    }
  } catch (error) {
    console.error(`❌ Błąd powiadamiania pagera ${pagerNumber}:`, error.message);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Sprawdza status połączenia z pagerem
 * @param {string} pagerNumber - Numer pagera
 */
const checkPagerStatus = async (pagerNumber) => {
  try {
    // TODO: Ping do pagera
    console.log(`🔍 Sprawdzanie statusu pagera ${pagerNumber}`);
    
    return {
      online: true,
      pagerNumber,
      batteryLevel: 100 // TODO: Rzeczywisty poziom baterii
    };
  } catch (error) {
    return {
      online: false,
      pagerNumber,
      error: error.message
    };
  }
};

module.exports = {
  notifyPager,
  checkPagerStatus
};
