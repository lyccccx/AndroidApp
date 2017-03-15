//页面加载完毕后初始化事件
$(function () {
    try {
        //每次都初始化一次Swiper
        $(document).on('pageInit', '#MainPage', function () {
            InitSwiper();
            //获取店铺信息
        });
        //主页
        $(document).on('click', '.HomePageLink', function () {
            $.router.load(WebSiteName + "/Home/Index");
        });
        //单击头像路由到用户界面
        $(document).on('click', '.UserInfoPageLink', function () {
            var OpenID = $(this).children(".OpenID").val();
            $.router.load(WebSiteName + "/UserInfoPage/Index?OpenID=" + OpenID);
        });
        //搜索页
        $(document).on('click', '.SearchPageLink', function () {
            $.router.load(WebSiteName + "/Home/SearchPage");
        });
        //购物车页
        $(document).on('click', '.CartPageLink', function () {
            var OpenID = $(this).children(".OpenID").val();
            $.router.load(WebSiteName + "/CartPage/Index?OpenID=" + OpenID,true);
        });
        // SearchPage页加载事件
        $(document).on("pageInit", "#SearchPage", function (e, id, page) {
            //获取焦点
            $("#SearchPage-search")[0].focus();
        });
        //搜索按钮单击事件
        $(document).on('click', '#do-search', function () {
            $.toast("do1");
        });

        //主页面搜索框焦点事件，切换到搜索页面
        $(document).on('click', '.DoSearch', function () {
            $.router.load(WebSiteName + "/Home/SearchPage");
        });

        //清空搜索内容
        $(document).on('click', '#cancel-search', function () {
            $.toast("cancel");
        });

        //单击商品跳转事件
        $(document).on('click', '.ProductShow', function () {
            var ProductID = $(this).find(".ProductID").val();
            var OpenID = $(this).find(".OpenID").val();
            //【注：由切换效果可知，如果路由参数一样则调用缓存】
            $.router.load(WebSiteName + "/ProductDetailPage/index?ProductID=" + ProductID + "&OpenID=" + OpenID);//Ajax加载页面，忽略缓存
        });

        //无限刷新初始化
        // 加载flag
        var loading = false;
        // 注册'infinite'事件处理函数
        $(document).on('infinite', '.infinite-scroll-bottom', function () {
            if (!IsOnLine()) { return false; }
            // 如果正在加载，则退出
            if (loading) {
                return;
            }
            // 设置flag
            loading = true;
            if (false) {//加载到底部
                // 加载完毕，则注销无限加载事件，以防不必要的加载
                $.detachInfiniteScroll($('.infinite-scroll'));
                // 删除加载提示符
                $('.infinite-scroll-preloader').remove();
                return;
            }
            setTimeout(function () {
                // 添加新条目
                loading = AddProducts();
                //容器发生改变,如果是js滚动，需要刷新滚动
                $.refreshScroller();
            }, 200);//【注：】需延时，不然会产生队列效果，一直加载到队列完毕
        });

        //搜索结果页面
        $(document).on("click", ".BaseActive", function () {
            $(".BaseActive").removeClass("active");
            $(this).addClass("active");
        })
        //按销量筛选
        $(document).on("click", "#BaseHasSales", function () {

        });
        //按价格筛选
        $(document).on("click", "#BasePrice", function () {

        });
        //按评价筛选
        $(document).on("click", "#BaseTalk", function () {

        });

        //滑动图片点击
        $(document).on("click", ".swiper-slide", function () {
            var url = $(this).children(".Url").val();
            if (url) {
                var OpenID = $(this).children(".OpenID").val();
                var ProductID = $(this).children(".ProductID").val();
                url = url + "?OpenID=" + OpenID + "&ProductID=" + ProductID;
                $.router.load(WebSiteName + url, true);
            }
        });

        //加盟页
        BackTwoTime = false;
        $(document).on("click", "#JoinUsPage-OK", function () {
            var openid = $(this).children(".OpenID").val();
            var Data = $("#JoinUsPage-Form").serialize();
            //Ajax提交数据后路由
            SaveJoinUsInfo(Data, openid);
        });
        //确认店铺
        $(document).on("click", "#MyShopPage-OK", function () {
            $.router.back();
            if (BackTwoTime) {
                BackTwoTime = false;
                setTimeout(function () { $.router.back(); }, 10)
            }
        });
        $(document).on("click", ".SearchTypeLink", function () {
            $.router.load(WebSiteName + "SearchResult/Index?Type=type");
        });

    }
    catch (ex) {
        if (IsDebug) {
            $.alert(ex);
        }
    }
    //$.init();
});


//页面调用函数
//滑到底部添加商品
function AddProducts() {
    if (!IsOnLine()) { return false; }
    if (UserOpenID == '') {
        UserOpenID = $("#OpenID").val();
    }
    $.ajax({
        url: WebSiteName + "/Home/GetProducts",
        type: "POST",
        data: {
            OpenID: UserOpenID,
        },
        cache: false,
        timeout: 8000,
        success: function (data) {
            if (data.status == 'success') {
                var data1 = data.html;
                var data2 = JSON.stringify(data.html);
                $("#MainFoodsTable").append(data.html);
            }
            else {
                $.toast(data.html);
            }
            return false;//Flag
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            if (IsDebug) {
                $.alert(textStatus + errorThrown);// 通常情况下textStatus和errorThown只有其中一个有值
            }
            else {
                $.alert("访问异常，请稍后再试");
            }
            return false;//Flag
        },
    });
};

//保存加盟信息
function SaveJoinUsInfo(Data, OpenID) {
    if (!IsOnLine()) { return false; }
    $.ajax({
        url: WebSiteName + "/WeChat/SaveJoinUsInfo",
        type: "POST",
        data: Data,
        cache: false,
        timeout: 8000,
        success: function (data) {
            if (data.status == 'success') {
                UserOpenID = OpenID;
                $.router.load(WebSiteName + "/WeChat/MyShop?OpenID=" + OpenID, true);
                //由加盟页跳转,到我的店铺页面时需返回两次;
                BackTwoTime = true;
            }
            else {
                $.alert(data.html);
            }
            return false;//Flag
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            if (IsDebug) {
                $.alert(textStatus + errorThrown);// 通常情况下textStatus和errorThown只有其中一个有值
            }
            else {
                $.alert("访问异常，请稍后再试");
            }
            return false;//Flag
        },
    });
}

//初始化滑动控件
function InitiaSwiper(swiper, pagination) {
    $(swiper).swiper({
        pagination: pagination,
        slidesPerView: 1,
        paginationClickable: true,
        spaceBetween: 0,
        loop: true,
        autoplay: 3000,
        autoplayDisableOnInteraction: true,
    });
};

function InitSwiper() {
    var swiper = new Swiper('.swiper-container', {
        pagination: '.swiper-pagination',
        slidesPerView: 1,
        paginationClickable: true,
        spaceBetween: 0,
        loop: true,
        autoplay: 3000,
        autoplayDisableOnInteraction: true,
    });
};

//移除所选
function DeleteSelected(Areaid) {
    $("#" + Areaid).find(".OrderNo").each(function (index, domEle) {
        var OrderNo = $(domEle).val();
        //AJax移除订单
    });
}

//获取店铺信息，有则加载
function GetShopInfo() {
    if (!IsOnLine()) { return false; }
    $.ajax({
        url: WebSiteName + "/Home/GetShopInfo",
        type: "POST",
        data: {
            OpenID: UserOpenID,
        },
        cache: false,
        timeout: 8000,
        success: function (data) {
            if (data.status == 'success') {
                var data1 = data.html;
                var data2 = JSON.stringify(data.html);

            }
            else {
                $.toast(data.html);
            }
            return false;//Flag
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            if (IsDebug) {
                $.alert(textStatus + errorThrown);// 通常情况下textStatus和errorThown只有其中一个有值
            }
            else {
                $.alert("访问异常，请稍后再试");
            }
            return false;//Flag
        },
    });
}
