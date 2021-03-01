$(function(){

    $(".checkbox").change(function() {
        if (this.checked) {
            let id = $("input[name=id]").val();

            swal({
                title: "Are you sure?",
                text: "Once deleted, you will not be able to recover this item",
                icon: "warning",
                buttons: true,
                dangerMode: true,
            })
              .then((willDelete) => {
                if (willDelete) {
                    $('#'+id).submit();
                } else {
                  this.checked = false;
                  
                }
            });    
               
        }
    })

});
