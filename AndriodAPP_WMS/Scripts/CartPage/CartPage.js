//页面加载完毕后初始化事件
$(function () {
    try {
        // CartPage页加载事件
        $(document).on("pageAnimationStart", "#CartPage", function (e, id, page) {
            //加载页面时 隐藏全部可隐藏Tr
            $(".CanHideTab").hide();
            $(".TextSwich").text("详情");
        });

        //导航栏全选事件
        $(document).on('click', '#AllSelectBtn', function () {
            var Text = $("#AllSelectText").text();
            if (Text == '全选') {
                $(this).addClass("active");
                $("#AllSelectText").text("全不选");
                $("#TotalFeeID").text("888.00");
            }
            else {
                $(this).removeClass("active");
                $("#AllSelectText").text("全选");
                $("#TotalFeeID").text("0.00");
            }
        });

        $(document).on('click', '#CartPage-TotalMoney', function () {
            var money = $("#CartPage-TotalFeeID").text();
            var OpenID = $(this).find(".OpenID").val();
            var Content = '提交金额为￥' + money;
            CartPayMoney(OpenID);
            //$.confirm(Content, '订单金额确认', function () {
            //    //$.router.load("#UserInfoPage");
            //    //$("#PayedTabID").click();
            //    CartPayMoney(OpenID);
            //});
        });
    }
    catch (ex) {
        if (IsDebug) {
            $.alert(ex);
        }
    }
    //【注：】最后调用
    //$.init();
});

//页面调用函数
//购物车结算支付
function CartPayMoney(OpenID) {
    if (!IsOnLine()) { return false; }
    $.showPreloader("订单生成中，请稍后...");
    var OrderJsonStr = CreateOrderJson(OpenID);
    $.ajax({
        url: WebSiteName + "/CartPage/CartPayMoney",
        type: "POST",
        data: { OrderJsonStr: OrderJsonStr },
        cache: false,
        timeout: 8000,
        success: function (data) {
            $.hidePreloader();
            if (data.status == 'success') {
                //$.toast(data.html);
                //获取订单列表
                OrderJson = JSON.parse(OrderJsonStr);
                var OrderNoUrl = "";
                for (var i = 0; i < OrderJson.Length; i++) {
                    OrderNoUrl += OrderJson.OrderNo + "&";
                }
                $.router.load(WebSiteName + "/WeChat/PayPageConfirm?" + OrderNoUrl + "OpenID=" + OpenID, true);
            }
            else {
                $.alert(data.html);
            }
            return false;//Flag
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            $.hidePreloader();
            //textStatus=timeout
            if (textStatus != null) {
                $.toast("网络超时，请稍后再试");
            }
                //Not Found Internal Server Error
            else if (errorThrown != null) {
                $.toast("连接服务器异常，请稍后再试");
            }
            return false;//Flag
        },
    });
}