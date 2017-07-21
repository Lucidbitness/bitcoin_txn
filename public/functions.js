
//var middlewareObj = {};

//middlewareObj.Pickdate = function(){
   $(function () {
            $('input[name="datefilter"]').daterangepicker({
                autoUpdateInput: false,
                locale: {
                cancelLabel: 'Clear'
                }               
            });

            $('input[name="datefilter"]').on('apply.daterangepicker', function(ev, picker) {
                $(this).val(picker.startDate.format('YYYY-MM-DD') + '-' + picker.endDate.format('YYYY-MM-DD'));
                //console.log(dateStart, dateEnd);
               

            });

            $('input[name="datefilter"]').on('cancel.daterangepicker', function(ev, picker) {
                $(this).val('');
            });

       });
//}
//module.exports = middlewareObj;


 


 