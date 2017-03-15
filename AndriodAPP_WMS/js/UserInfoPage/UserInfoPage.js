//页面加载完毕后初始化事件
$(function () {
    try {
        //页加载事件 隐藏 详情Tab
        $(document).on("pageAnimationStart", "#PayingPage", function (e, id, page) {
            HideDetailInfo();
        });
        $(document).on("pageAnimationStart", "#SendingPage", function (e, id, page) {
            HideDetailInfo();
        });
        $(document).on("pageAnimationStart", "#ReceivingPage", function (e, id, page) {
            HideDetailInfo();
        });
        $(document).on("pageAnimationStart", "#FinishPage", function (e, id, page) {
            HideDetailInfo();
        });
        $(document).on("pageAnimationStart", "#ChargebackPage", function (e, id, page) {
            HideDetailInfo();
        });
        $(document).on("pageAnimationStart", "#AskChargebackPage", function (e, id, page) {
            HideDetailInfo();
        });

        //申请退款
        $(document).on("click", "#AskChargebackProduct", function () {
            var OrderNo = $(this).find(".OrderNo").val();
            $.router.load(WebSiteName + "/UserInfoPage/AskChargeback?OrderNo=" + OrderNo);
            LoadUrlViaOpenID(this, "/UserInfoPage/AskChargeback");
        });


        //提醒发货 或 查看物流信息
        $(document).on("click", ".TrackProduct", function () {
            GetTrackingInfo();
        });

        //移除所选
        $(document).on('click', '#DeleteAllSelectBtn', function (e, id, page) {
            DeleteSelected(id);
        });
    }
    catch (ex) {
        if (IsDebug) {
            $.alert("UserInfoPage" + ex);
        }
    }
    //【注：】最后调用
    //$.init();
});
//页面调用函数

//查看物流信息
function GetTrackingInfo() {
    if (!IsOnLine()) { return false; }
    $.showPreloader('物流信息加载中....');
    $.ajax({
        url: WebSiteName + "/UserInfoPage/GetTracking?OrderNo=123",
        type: "POST",
        cache: false,
        timeout: 5000,
        success: function (data) {
            $.hidePreloader();
            if (data.status == 'success') {
                $.popup(data.html);
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            $.hidePreloader();
            if (IsDebug) {
                $.alert(textStatus + errorThrown);// 通常情况下textStatus和errorThown只有其中一个有值
            }
            else {
                $.alert("访问异常，请稍后再试");
            }
            return false;
        }
    });
}

//加载页面时 隐藏全部可隐藏Tab
function HideDetailInfo() {
    $(".CanHideTab").hide();
    $(".TextSwich").text("详情");
}