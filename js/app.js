$(document).ready(function(){
  OAuth.initialize('FYfXeswYteklWvsjd_jwbdHdv28');

  $('.signin').click(function() {
    OAuth.popup('twitter', function(err, api) {
      // Once auth-ed, show the rest of the UI.
      $('.signin').hide();
      $('.afterSignin').show();
      var inProgress = false;

      $('.createShadow').click(function() {
        if (inProgress) return;

        // Update the UI
        var inProgress = true;
        $('.progress').html('Creating shadow. This might take a few minutes...').addClass('showIndicator').show();
        $('.username').attr('disabled', 'disabled');
        $('.createShadow').addClass('disabled');

        // Get the inputted username, cleaning off any leading at symbols
        var user = $('.username').val();
        if (!user) return;
        if (user[0] === '@') user = user.slice(1);

        // Twitter API urls
        var friendsURL = 'https://api.twitter.com/1.1/friends/ids.json?screen_name=' + user;
        var createListURL = 'https://api.twitter.com/1.1/lists/create.json';
        var addToListURL = 'https://api.twitter.com/1.1/lists/members/create_all.json';

        // Get a list of the user's friends
        api.get(friendsURL).done(function(data) {
          var friendIds = data.ids;

          var postData = {
            name: 'Shadow: ' + user,
            mode: 'private',
          };

          // Create a list with that user's name
          api.post(createListURL, {data: postData}).done(function(data) {
            console.log(data);
            var listId = data.id;
            var listURI = data.uri;

            var requestCount = 0;

            // Post users to the list, in increments of 20
            for (var i = 0; i < friendIds.length; i+= 20) {
               var subset = friendIds.slice(i, i + 20);
               var data = {
                list_id: listId,
                user_id: subset.join(',')
              };

              requestCount++;
              api.post(addToListURL, {data: data}).done(function(data) {
                requestCount--;
                if (requestCount === 0) {
                  console.log('finished');

                  // Restore the UI to it's original state
                  inProgress = false;
                  $('.progress').removeClass('showIndicator').html('@' + user + ' shadowed. View their timeline <a href="https://twitter.com/' + listURI + '">here</a>.');
                  $('.username').removeAttr('disabled').val('');
                  $('.createShadow').removeClass('disabled');
                }
              });
            }
          });
        });
      });
    });
  });
});