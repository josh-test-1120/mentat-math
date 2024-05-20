document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', function(event) {
            if (this.getAttribute('href').startsWith('#')) {
                event.preventDefault();
                // Handle the fragment identifier behavior
            }
        });
    });
});
