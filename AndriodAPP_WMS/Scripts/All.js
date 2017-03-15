
//全局变量放置
IsDebug = true;//是否调试开关

IsOnline = true;//客户端是否在线联网

WebSiteName = '';//IIS发布时站点名称

UserOpenID = '';//用户OpenID

StepCount = 1;//商品加减控件步长值

//全局事件注册
$(function () {
    try {
        //掉线事件
        window.addEventListener("offline", function (e) {
            IsOnline = false;
            $.toast("网络已断开");
        });
        //在线事件
        window.addEventListener("online", function (e) {
            IsOnline = true;
            $.toast("网络已连接");
        });

        //控件事件
        //加减控件 加商品值
        $(document).on('click', '.AddProduct', function () {
            //获取当前数量值
            var count = GetInputValue(this);
            //计算数量
            count = count + StepCount;
            //获取库存值
            var MaxCount = GetStoreValue(this, ".MaxCount");
            if (count >= MaxCount) {
                count = MaxCount;
            }
            SetInputValue(this, count);
            //计算SizeFee
            SetSizeFee(this, count);
        });

        //加减控件 减商品值
        $(document).on('click', '.SubtracteProduct', function () {
            //获取当前数量值
            var count = GetInputValue(this);
            count = count - StepCount;
            if (count < 0) {
                count = 0;
            }
            SetInputValue(this, count);
            //计算SizeFee
            SetSizeFee(this, count);
        });

        //加减控件 直接设置商品值  失去焦点验证
        $(document).on('blur', '.FocusAuth', function (e) {
            //获取输入的数值
            var count = $(this).val();
            count = parseInt(count);
            if (isNaN(count)) { count = 0; }
            else {
                //获取库存值
                var MaxCount = GetStoreValue(this, ".MaxCount");
                if (count <= 0) {
                    count = 0;
                }
                else if (count >= MaxCount) {
                    count = MaxCount;
                }
            }
            $(this).val(count);
            //计算SizeFee
            SetSizeFee(this, count);
        });

        //全选框
        $(document).on('click', '.ALLCheckBox-CartPage', function () {
            //激活全选样式
            SetActive(this, "All");
        });

        //多选框
        //单击激活选择样式
        $(document).on('click', '.OneCheckBox-CartPage', function () {
            //获取子元素值，判断是否选中
            SetActive(this, "One");
        });

        //折叠 详情
        $(document).on('click', '.ShowHideSwich', function () {
            var text = $(this).children(".TextSwich").text();
            if (text == '详情') {
                AnimationOutIn(this, "In");
                $(this).children(".TextSwich").text("折叠");
            }
            else {
                AnimationOutIn(this, "Out");
                $(this).children(".TextSwich").text("详情");
            }
        });

        //点击移除按钮
        $(document).on('click', '.DeleteOrder', function () {
            //location.reload();
        });

        //返回
        $(document).on("click", ".MyBack", function () {
            $.router.back();
        });

        //通过OpenID的连接类 加载相关页面
        $(document).on("click", ".OpenIDLink", function () {
            var OpenID = $(this).find(".OpenID").val();
            //判断是否有提示，有则提示
            var isTip = $(this).find(".Tip").val();
            if (isTip) {
                var TipUrl = $(this).find(".TipUrl").val();
                $.confirm(isTip, function () {
                    $.router.load(WebSiteName + TipUrl + "?OpenID=" + OpenID);
                });
                return false;
            }
            var Url = $(this).find(".Url").val();
            $.router.load(WebSiteName + Url + "?OpenID=" + OpenID);
        });

        //提交订单构造JSON对象【针对提交到购物车】
        $(document).on("click", "#AddProductsToCart", function () {
            var OpenID = $(this).find(".OpenID").val();
            SaveOrderToCart(CreateOrderJson(OpenID));
        });

        //微信支付
        $(document).on("click", "#WxSafePay", function () {
            WxSafePay();
        });

    }
    catch (ex) {
        if (IsDebug) {
            $.alert("All.js" + ex);
        }
    }
    //$.init(); 【注:不可再初始化swiper之前初始化！！！会导致工作不正常】
    //幻灯片会在你页面入口执行$.init()后自动初始化
});

//检查网络
function IsOnLine() {
    if (!IsOnline) {
        $.toast("网络异常");
        return false;
    }
    return true;
};

// 加减控件 获取存储数据值
function GetStoreValue(obj, Via) {
    return $(obj).parent().parent().parent().find(Via).val();
};
// 加减控件 设置存储数据值
function SetStoreValue(obj, Via, value) {
    $(obj).parent().parent().parent().find(Via).val(value);
};

// 加减控件 获取当前数量值
function GetInputValue(obj) {
    var value = parseInt($(obj).parent().parent().find(".FocusAuth").val());
    if (isNaN(value)) {
        return 0;
    }
    return value;
};
//加减控件 设置当前数量值
function SetInputValue(obj, value) {
    $(obj).parent().parent().find(".FocusAuth").val(value);
};

//计算单个尺寸价格 订单总价格
function SetSizeFee(obj, count) {
    //获取单价(分为单位)
    var price = GetStoreValue(obj, ".Price");
    var sizefee = count * price;
    SetStoreValue(obj, ".SizeFee", sizefee);//设置费用
    SetStoreValue(obj, ".Count", count);//设置数量
    var orderno = GetStoreValue(obj, ".OrderNo");
    SetTips(orderno);
};

//全选获取子元素
function SelectAllGetChilden(obj) {
    return $(obj).find(".CheckBox");
};
//全选获取全部单选元素
function SelectAllGetAllSingle(obj) {
    return $(obj).parent().parent().siblings(".CanHideTab").find(".CheckBox")
};

//单个订单多选、单选样式处理
function SetActive(obj, IsOneOrAll) {
    var flag = $(obj).find(".CheckBox").hasClass("CheckBoxActive");
    var orderno = "";
    switch (IsOneOrAll) {
        case "One":
            if (flag) {
                //单选框
                $(obj).find(".CheckBox").removeClass("CheckBoxActive");
                //选取标识
                $(obj).parent().find(".SizePricediv").removeClass("HasCheck");
            }
            else {
                $(obj).find(".CheckBox").addClass("CheckBoxActive");
                $(obj).parent().find(".SizePricediv").addClass("HasCheck");
            }
            //操作全选
            orderno = $(obj).parent().find(".OrderNo").val();
            var allselectActive = true;//默认激活
            $("#" + orderno).find(".OneCheckBox-CartPage").each(function (index, dom) {
                if (!$(dom).find(".CheckBox").hasClass("CheckBoxActive")) {
                    allselectActive = false;
                    return false;//不激活
                }
            });
            if (!allselectActive) {
                $("#" + orderno).find(".ALLCheckBox-CartPage").find(".CheckBox").removeClass("CheckBoxActive");
            }
            else {
                $("#" + orderno).find(".ALLCheckBox-CartPage").find(".CheckBox").addClass("CheckBoxActive");
            }
            break;
        case "All":
            orderno = $(obj).find(".OrderNo").val();
            var vv = $("#" + orderno).find(".CheckBox");
            if (!flag) {
                //单选框全部失效
                $("#" + orderno).find(".CheckBox").addClass("CheckBoxActive");
                //选取标识全部失效
                $("#" + orderno).find(".SizePricediv").addClass("HasCheck");
            }
            else {
                //单选框全部失效
                $("#" + orderno).find(".CheckBox").removeClass("CheckBoxActive");
                //选取标识全部失效
                $("#" + orderno).find(".SizePricediv").removeClass("HasCheck");
            }
            break;
    }
    SetTips(orderno);
};

//折叠获取可隐藏列
function AnimationOutIn(obj, OutIn) {
    var Selector = "#" + $(obj).children(".HideTabsID").val();
    var Prefix = "lightSpeed";
    var InClass = Prefix + "In";
    var OutClass = Prefix + "Out";
    if ($(Selector).hasClass(OutClass)) {
        $(Selector).removeClass(OutClass);
    }
    if ($(Selector).hasClass(InClass)) {
        $(Selector).removeClass(InClass);

    }
    switch (OutIn) {
        case "Out":
            $(Selector).addClass(OutClass);
            setTimeout(function () { $(Selector).hide(); }, 500);
            break;
        case "In":
            $(Selector).show();
            $(Selector).addClass(InClass);
            break;
    }
};

//显示单个订单所有提示
function SetTips(OrderNo) {
    var OrderBadgeID = null;
    var OrderFee = 0;
    $("#" + OrderNo).find(".ColorTab").each(function (index, ColorTabDom) {
        var ColorTabTemp = $(ColorTabDom);
        var ColorFee = 0;
        var ColorBadgeID = null;
        $(ColorTabTemp).find(".SizePricediv").each(function (index, SizeDom) {
            var SizeTemp = $(SizeDom);
            if (SizeTemp.hasClass("HasCheck")) {
                ColorFee += parseInt(SizeTemp.find(".SizeFee").val(), 10);
                OrderFee += parseInt(SizeTemp.find(".SizeFee").val(), 10);
            }
            if (!ColorBadgeID) {
                ColorBadgeID = SizeTemp.find(".ColorFeeBadgeID").val();
                OrderBadgeID = SizeTemp.find(".OderFeeBadgeID").val();
            }
        });
        if (ColorFee > 0) {
            $("#" + ColorBadgeID).text("￥" + Math.round(ColorFee / 100));
        }
        else { $("#" + ColorBadgeID).text("") }
    });
    $("#" + OrderNo).find(".OrderFee").val(OrderFee);
    if (OrderFee > 0) {
        $("#" + OrderBadgeID).text("￥" + (OrderFee / 100).toFixed(2));
    }
    else {
        $("#" + OrderBadgeID).text("");
    }
    //购物车设置交易全部金额
    var totalfeeid = $("#CartPage-TotalFeeID");
    if (totalfeeid.length > 0) {
        var totalfee = 0;
        $("#CartPageID").find(".OrderValueStore").each(function (index, order) {
            totalfee = parseInt(totalfee, 10) + parseInt($(order).find(".OrderFee").val(), 10);
        });
        totalfeeid.text((totalfee / 100).toFixed(2));
    }
};

//构造订单JSON对象
function CreateOrderJson(openid) {
    //订单数组列表
    var ArrayOrder = new Array();
    //在获取订单类【购物车只有一个订单类，购物车有>=0个订单类】
    $(".OrderClass").each(function (OrderIndex, OrderDom) {
        var Order = {};
        Order.OrderNo = $(OrderDom).attr("id");
        Order.OpenID = openid;
        Order.ProductID = $(OrderDom).find(".ProductID").val();
        Order.TotalFee = 0;
        if (Order.OrderNo) {
            var ArrayColor = new Array();
            $("#" + Order.OrderNo).find(".ColorTab").each(function (ColorIndex, ColorDom) {
                var Color = {};
                Color.ColorID = $(ColorDom).attr("id");
                if (Color.ColorID) {
                    var ArraySize = new Array();
                    $("#" + Color.ColorID).find(".SizePricediv").each(function (SizeIndex, SizeDom) {
                        var Size = {};
                        Size.SizePriceID = $(SizeDom).attr("id");
                        Size.Price = $(SizeDom).find(".Price").val();
                        Size.Count = $(SizeDom).find(".Count").val();
                        Size.SizeFee = $(SizeDom).find(".SizeFee").val();
                        Order.TotalFee += Size.Count * Size.Price;
                        ArraySize.push(Size)
                    });
                    Color.SizePriceStoreList = ArraySize;
                }
                ArrayColor.push(Color);
            });
        }
        Order.ColorList = ArrayColor;
        ArrayOrder.push(Order);
    });
    return JSON.stringify(ArrayOrder);
};

//保存商品到购物车，生成订单
function SaveOrderToCart(OrderJson) {
    if (!IsOnLine()) { return false; }
    $.ajax({
        url: WebSiteName + "/ProductDetailPage/SaveOrderToCart",
        type: "POST",
        data: { OrderJsonStr: OrderJson },
        cache: false,
        timeout: 8000,
        success: function (data) {
            if (data.status == 'success') {
                $.toast(data.html);
                //$.router.load(WebSiteName + "/CartPage/Index?OpenID=" + UserOpenID, true);
            }
            else {
                $.alert(data.html);
            }
            return false;//Flag
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
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
};

//微信支付
function WxSafePay() {
    //WxOrderQuery();
    //return false;
    var OpenID = $("#PayConfirm-Page").find(".OpenID").val();
    var OrderNo = $("#PayConfirm-Page").find(".OrderNo").val();
    var UrlData = "actionString=jspay&OpenID=" + OpenID + "&OrderNo=" + OrderNo;
    if (!IsOnLine()) { return false; }
    $.ajax({
        url: WebSiteName + "/WeChat/WxPay",
        type: "POST",
        data: UrlData,
        cache: false,
        timeout: 8000,
        success: function (data) {
            if (data.status == "success") {
                var param = data.html;
                wx.chooseWXPay({
                    timestamp: param.timeStamp, // 支付签名时间戳，注意微信jssdk中的所有使用timestamp字段均为小写。但最新版的支付后台生成签名使用的timeStamp字段名需大写其中的S字符
                    nonceStr: param.nonceStr, // 支付签名随机串，不长于 32 位
                    package: param.package, // 统一支付接口返回的prepay_id参数值，提交格式如：prepay_id=***）
                    signType: param.signType, // 签名方式，默认为'SHA1'，使用新版支付需传入'MD5'
                    paySign: param.paySign, // 支付签名
                    success: function (res) {
                        //余额不足微信支付已处理，这里只接受支付成功的状态
                        //无需查询订单状态，若客户单击订单查询，则自动跳转至代发货订单并查询
                        //状态成功后订单变更为待发货订单
                        SaveChangeOrderSate(OrderNo, 2);
                    },
                    cancel: function (res) {
                        //保存到购物车
                        //若已保存到购物车则更新数据

                        //取消保存预支付ID
                    }
                });
            }
            else {
                $.alert("支付失败(IF):" + data.ExceptionTips);
            }
            return false;//Flag
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
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
};

//微信订单查询
function WxOrderQuery(UrlQuery) {
    if (!IsOnLine()) { return false; }
    $.ajax({
        url: WebSiteName + UrlQuery,
        type: "POST",
        cache: false,
        timeout: 8000,
        success: function (data) {
            if (data.status == "success") {

            }
            else {
                $.alert("订单查询失败，请稍后再试");
            }
            return false;//Flag
        },
        error: AjaxErrorFunction(XMLHttpRequest, textStatus, errorThrown)
    });
};

//变更订单状态
function SaveChangeOrderSate(OrderNo, OrderState) {
    if (!IsOnLine()) { return false; }
    $.ajax({
        url: WebSiteName + "/WeChat/SaveChangeOrderSate",
        type: "POST",
        data: { OrderNo: OrderNo, OrderState: OrderState },
        cache: false,
        timeout: 8000,
        success: function (data) {
            if (data.status == "success") {

            }
            else {
                $.alert("系统异常，请稍后再试");
            }
            return false;//Flag
        },
        error: AjaxErrorFunction(XMLHttpRequest, textStatus, errorThrown)
    });
};

//Ajax提交错误返回函数
function AjaxErrorFunction(XMLHttpRequest, textStatus, errorThrown) {
    //$.alert("jjjj");
    //textStatus=timeout
    if (textStatus != null) {
        $.toast("网络超时，请稍后再试");
    }
        //Not Found Internal Server Error
    else if (errorThrown != null) {
        $.toast("连接服务器异常，请稍后再试");
    }
    return false;//Flag
};

//【框架需注意事项】
//1：使用JS 返回 $.router.back();具有右切换的效果，客户体验较好，使用Href统一向左切换。
//2：$.init()函数影响 Swiper的初始化，导致乱切换，必须在调用Swiper初始化配置之后才使用$.init()函数。
//3:Razor中，@{var Test}代码块中Test为对整个文件来说是全局变量,在其他@{}、@foreach代码块中可以访问到
//  ，@foreach{var Test1}代码块中Test1为区域变量，其他代码块中不能访问到
//4:MAV Razor调试 打开mvc项目的csproj文件：<MvcBuildViews>false</MvcBuildViews>改为<MvcBuildViews>true</MvcBuildViews>
//5:使用MyBack[一个定义类]返回主页时Swiper不正常，使用ID点击返回时Swiper正常，可能是类遍历了Dom，导致不正常
//6:LocalDB [MDF文件数据库]放置到IIS上时，配置IIS应用程序池高级选项里的标识为LocalSystem即可
//解决查询字符串过长问题 ()6.1 6.2同时设置
//6.1 <system.web> <httpRuntime maxQueryStringLength="2097151" />
//6.1 <system.webServer> <security> <requestFiltering> <requestLimits maxQueryString="2000000"></requestLimits>

//【微信支付问题参考】
//1:当前页面的url未注册 
//http://www.thinkphp.cn/code/1620.html


//店铺二维码 李延创
//https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=gQGa8DwAAAAAAAAAAS5odHRwOi8vd2VpeGluLnFxLmNvbS9xLzAydGltdWRHM25kajExMDAwMGcwN3gAAgQFhmtYAwQAAAAA
//https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=gQGa8DwAAAAAAAAAAS5odHRwOi8vd2VpeGluLnFxLmNvbS9xLzAydGltdWRHM25kajExMDAwMGcwN3gAAgQFhmtYAwQAAAAA
//授权页面
//https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxe2d9c97b5faa789e&redirect_uri=http%3a%2f%2fh15199868k.iask.in&response_type=code&scope=snsapi_userinfo&state=WMS#wechat_redirect