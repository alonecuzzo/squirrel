$(function() {
	var selectedNotebooks = [],
		infoObject = {};
	$('#save-profile').click(function(e){
		// e.preventDefault();
		infoObject.selectedNotebooks = selectedNotebooks;
		console.log('infoObject: ' + JSON.stringify(infoObject));
		$.ajax({
			type: 'POST',
			data: JSON.stringify(infoObject),
	        contentType: 'application/json',
            url: '/thanks',						
            success: function(data) {
                console.log('success');
                // console.log(JSON.stringify(data));
            }, 
            error: function(jqXHR, textStatus, err){
               alert('text status '+textStatus+', err '+err)
           }
        });
	});
	$('.book-checkbox').click(function(e){
		if($(this).is(':checked')) {
			//add to array
			selectedNotebooks.push(this.value);
		} else {
			//remove from array
			for(var i = 0; i<selectedNotebooks.length; i++) {
				if(this.value === selectedNotebooks[i]) {
					selectedNotebooks.splice(i, 1);
				}
			}
		}
		console.log('dsaf: ' + selectedNotebooks);
	});
});