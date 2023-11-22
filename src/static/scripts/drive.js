function fetchData() {
    // Create a new XMLHttpRequest object
    var xhr = new XMLHttpRequest();
  
    // Configure the request (GET or POST, URL, etc.)
    xhr.open('GET', '/GetBattery', true);
  
    // Define what happens on successful completion of the request
    xhr.onload = function() {
      if (xhr.status === 200) {
        // Process the response data here
        var imgUrl = '';
        switch (true) {
            case parseInt(xhr.responseText) > 80:
                imgUrl = '/static/img/battery_100.svg';
                break;
            case parseInt(xhr.responseText) > 60:
                imgUrl = '/static/img/battery_75.svg';
                break;
            case parseInt(xhr.responseText) > 40:
                imgUrl = '/static/img/battery_50.svg';
                break;
            case parseInt(xhr.responseText) > 10:
                imgUrl = '/static/img/battery_25.svg';
                break;
            default:
                imgUrl = '/static/img/battery_0.svg';
                break;
        }
        document.getElementById('imgBatteryCharge').src = imgUrl;
        document.getElementById('imgBatteryCharge').title = xhr.responseText + "%";
      }
    };
  
    // Send the request
    xhr.send();
}



$(document).ready(function() {
    // Call the fetchData function initially
    fetchData();

    // Set an interval to execute the fetchData function every 60 seconds (60000 milliseconds)
    setInterval(fetchData, 60000);

    var isTouchedOrPressed = false;
    var debounceTimeout = null;

    function debounceAction(endpoint) {
        if (!isTouchedOrPressed) {
            isTouchedOrPressed = true;
            // Call the corresponding Flask route
            $.ajax({
                type: 'GET',
                url: endpoint,  // Replace with your Flask endpoint URL
                success: function(response){
                    $('#logDiv').append('<p>' + response + '</p>');
                }
            });

            debounceTimeout = setTimeout(function() {
                isTouchedOrPressed = false;
            }, 5000); // Adjust the delay as needed (in milliseconds)
        }
    }

    // Event handlers for touchstart and mousedown on specific divs
    $("#driveforward, #driveleft, #driveright, #drivebackward, #drivebrake").on('touchstart mousedown', function(event) {
        var endpoint = '';
        switch ($(this).attr('id')) {
            case 'driveforward':
                endpoint = '/Forward';
                $(this).css('background-position', '0 -90px');
                break;
            case 'driveleft':
                endpoint = '/Left';
                $(this).css('background-position', '-90px 0');
                break;
            case 'driveright':
                endpoint = '/Right';
                $(this).css('background-position', '-90px 0');
                break;
            case 'drivebackward':
                endpoint = '/Backward';
                $(this).css('background-position', '0 -90px');
                break;
            case 'drivebrake':
                endpoint = '/Stop';
                $(this).css('background-position', '-150px 0');
                break;
            default:
                break;
        }
        debounceAction(endpoint);
    });

    // Event handler for touchend and mouseup on specific divs
    $("#driveforward, #driveleft, #driveright, #drivebackward, #drivebrake").on('touchend mouseup', function(event) {
        clearTimeout(debounceTimeout);
        isTouchedOrPressed = false;
        // Call the '/Stop' Flask route
        $.ajax({
            type: 'GET',
            url: '/Stop',  // Replace with your Flask endpoint URL
        });
        $(this).css('background-position', '0 0');
    });
    
    // Disable context menu on long touch (press and hold)
    $("#driveforward, #driveleft, #driveright, #drivebackward, #drivebrake").on('contextmenu', function(event) {
        event.preventDefault();
    });
});