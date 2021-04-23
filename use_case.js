const nc = Nuclear({
  app: 'credit_app'
});
nc.component("collected_row_string", {
  template: function (data) {
      if ('account_name' in data && data.account_name) {
          return "Tài khoản ${account_name}} trả nợ số tiền ${collection_amount}} , trong hợp đồng ${contract_no}} ${status}}!";
      } else {
          return (data.status ? data.status : 'Không rõ lỗi') + '';
      }
  },
  filter: function (data) {
    if ('account_name' in data && data.account_name) {
        let status = ('status' in data && data.status.length > 0) ? data.status.toLowerCase() : data.status;
        return {...data, status: status};
    }
    return data;
  }
});


// Other
nc.component('collected_body_row').mount(data.success, function (item) {
    if (item.error == false && item.collection_amount) {
        total_collection_amount += item.collection_amount;
        item.collection_amount = numberWithCommas(item.collection_amount);
    }
    toastr[item.error == false?'success':'error'](nc.component('collected_row_string').val(item));
});
nc.component('collected_foot_row').mount({
    collection_amount: numberWithCommas(total_collection_amount)
});

<div id="collected_modal" nc-app="credit_app" class="modal fade" role="dialog">
    <div class="modal-dialog modal-lg" style="width: fit-content;width: -moz-fit-content;">
        <div class="modal-content">
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal">×</button>
                <h4 class="modal-title text-center em-modal-header">Kết quả</h4>
            </div>
            <div class="modal-body">
                <div class="table-responsive">
                    <table class="table table-bordered" id="collected_table">
                        <thead>
                            <tr>
                                <th class="text-left" data-attr="account_name">A</th>
                                <th class="text-left" data-attr="contract_no">B</th>
                                <th class="text-left" data-attr="collection_amount">C</th>
                                <th class="text-left" data-attr="status">D</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr nc-component="collected_body_row">
                                <td>${account_name}}</td>
                                <td>${contract_no}}</td>
                                <td class="money">${collection_amount}}</td>
                                <td>${status}}</td>
                            </tr>
                        </tbody>
                        <tfoot>
                            <tr nc-component="collected_foot_row">
                                <th colspan="2" class="text-right">Tổng</th>
                                <th class="money">${collection_amount}}</th>
                                <th></th>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    </div>
</div>
