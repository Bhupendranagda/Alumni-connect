$(document).ready(function() {
    $('.delete-ourstories').on('click', function(e) {
        $target = $(e.target);
        const id = $target.attr('data-id');
        $.ajax({
            type: 'DELETE',
            url: '/ourstories/' + id,
            success: function(response) {
                alert('deleting ourstories');
                window.location.href = '/ourstories';
            },
            error: function(err) {
                console.log(err);
            }
        });
    });
});