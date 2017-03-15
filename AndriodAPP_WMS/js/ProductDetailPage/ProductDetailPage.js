//页面加载完毕后初始化事件
$(function () {
    try {
        // ProductDetailPage页加载事件
        $(document).on("beforePageSwitch", "#ProductDetailPage", function (e, id, page) {
            //滑到顶部【注:不能使用windows或document】window.scrollTo(0, 0);
            $("#Content-DetailPage").scrollTop(0);
            //$.init();//【注：】引发异常  Uncaught RangeError: Maximum call stack size exceeded.
        });

        //每次都初始化一次Swiper
        $(document).on('pageInit', '#ProductDetailPage', function () {
            InitSwiper();
        });

        //添加商品
        $(document).on('click', '.AddFoodsTabIDAction', function () {
            $("#AddFoodsTabID").click();
        });

        //颜色切换
        $(document).on('click', '.ColorSwich', function () {
            var imgpath = $(this).children('.ImgPath').val();
            var orderid = $(".OrderClass").attr('id');
            $("#" + orderid).find(".Img100100").attr("src", imgpath);
        });

        //购买
        $(document).on('click', '#BuyProduct', function () {
        });

        //加载更多评论
        $(document).on('click', '#MoreTalks', function () {
            if (!IsOnLine()) { return false; }
            $.showPreloader('评论加载中....');
            $.ajax({
                url: WebSiteName + "/ProductDetailPage/GetMoreTalks?OrderNumberID=123",
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
        });

        //同类推荐单击
        $(document).on('click', '.SimilarRecommendClass', function () {
            var id = $(this).children("input").val();
            $.router.load(WebSiteName + "/ProductDetailPage/Index?ProductID=" + id, true);//Ajax加载页面，忽略缓存
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
