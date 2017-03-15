//页面加载完毕后初始化事件
$(function () {
    try {
        //AddressPage 地址页面加载用户地址列表
        $(document).on("pageInit", "#AddressPage", function (e, id, page) {
            //拉取用户地址信息
            GetUserAddressInfoList();
        });
        //AddAddressPage 增加地址页面加载时，初始化省市区控件
        $(document).on("pageInit", "#AddAddressPage", function (e, id, page) {
            //初始化位置控件
            InitiaPicker();
            //点击新增地址时，获取用户当前位置信息
            getLocation();
        });

        //点击确认，增加用户地址信息
        $(document).on("click", "#AddAddressPage-OK", function () {
            var flag = SaveUserAddressInfo();
        });

        //新增地址
        $(document).on("click", "#AddAddress", function () {
            //清空表单
            var vv = $("#AddAddressPage-Form");
            $("#AddAddressPage-Form")[0].reset();
            $.router.load("#AddAddressPage");
        });

        //单击默认按钮
        $(document).on("click", ".ChekBoxAddressTd", function () {
            //移除地址全部高亮显示
            $(".ActiveAddress").removeClass("HighShowGreen");
            //移除全部选中标识
            $(".CheckBox").removeClass("CheckBoxActive");
            //本列表地址高亮显示
            $(this).parent().siblings(".ActiveAddress").addClass("HighShowGreen");
            //本列表选中标识
            $(this).children(".CheckBox").addClass("CheckBoxActive");
            //设置默认地址展示
            $("#DefaltAddressShow").val(GetTextViaTd(this));
        });
        //单击移除按钮
        $(document).on("click", ".DeleteAddressTd", function () {
            var AddressID = GetValViaTd(this);
            var AddressInfo = $(this).parent().siblings(".ActiveAddress").children("td").text();
            DeletaUserAddress(AddressID, AddressInfo)
        });
        //单击编辑按钮
        $(document).on("click", ".EditAddressTd", function () {
            //ajax获取地址信息
            var addressID = GetValViaTd(this);
            EditAddressInfo(addressID);
        });
    }
    catch (ex) {
        if (IsDebug) {
            $.alert(ex);
        }
    }
    //【注：】最后调用
    $.init();
});
//页面调用函数

//通过点击<td>标签获取表中隐藏的val()
function GetValViaTd(obj) {
    //this 为<td>标签
    return $(obj).parent().siblings(".ValueStore").children("td").children("input").val();
}
//通过点击<td>标签获取表中显示的地址信息，以便用来填充默认地址展示
function GetTextViaTd(obj) {
    return $(obj).parent().siblings(".ActiveAddress").children("td").text();
}


//初始化位置控件
function InitiaPicker() {
    $("#Location").cityPicker({
        toolbarTemplate: '<header class="bar bar-nav">\
    <button class="button button-link pull-right close-picker">确定</button>\
    <h1 class="title">省市区</h1>\
    </header>'
    });
};

//获取用户当前位置信息
function getLocation() {
    if (navigator.geolocation) {
        //getCurrentPosition(successCallback,errorCallback,positionOptions)--API
        navigator.geolocation.getCurrentPosition(showPosition, showError);
    }
    else {
        $.alert("不支持获取地理位置");
    }
}

//获取用户当前位置信息
function showPosition(position) {

    //返回当前位置静态图
    //var latlon = position.coords.latitude + "," + position.coords.longitude;
    //var img_url = "http://maps.googleapis.com/maps/api/staticmap?center="+ latlon + "&zoom=14&size=400x300&sensor=false";
    //document.getElementById("mapholder").innerHTML = "<img src='" + img_url + "'>";

    //返回当前省市区
    var latitude = position.coords.latitude;
    var longitude = position.coords.longitude;
    if (!IsOnLine()) { return false; }
    //获取省市区
    var URL = "http://api.map.baidu.com/geocoder/v2/?callback=renderReverse&location="
        + latitude
        + ","
        + longitude
        + "&output=json&pois=1&ak=L0m7MOLkQyaBhdShZnzx2EM0B44f2CSf";

    $.ajax({
        url: URL,
        type: "GET",
        cache: false,
        timeout: 8000,
        dataType: "jsonp",
        success: function (data) {
            if (data.status == 0) {
                var province = data.result.addressComponent.province;
                var city = data.result.addressComponent.city;
                var district = data.result.addressComponent.district;
                var street = data.result.addressComponent.street;
                if (district != "") {
                    $("#Location").val(province + " " + city + " " + district);
                }
                if (street != "") {
                    $("#DetailLocation").val(street);
                }
            }
        },
    });
}

//获取用户当前位置信息
function showError(error) {
    switch (error.code) {
        case error.PERMISSION_DENIED:
            $.alert("授权失败，请手动输入地址信息");
            break;
        case error.POSITION_UNAVAILABLE:
            $.alert("自动获取地址信息失败");
            break;
        case error.TIMEOUT:
            $.alert("请求地理位置超时");
            break;
        case error.UNKNOWN_ERROR:
            $.alert("未知错误");
            break;
    }
}

//保存新增用户地址信息
function SaveUserAddressInfo() {
    if (!IsOnLine()) { return false; }
    //验证
    var flag = CheckInfo();
    if (!flag) {
        return false;
    }
    var data = $("#AddAddressPage-Form").serialize();
    $.showPreloader('正在保存...请稍后')
    $.ajax({
        url: WebSiteName + "/AddressPage/SaveUserAddressInfo",
        type: "POST",
        data: data,
        cache: false,
        timeout: 8000,
        success: function (data) {
            $.hidePreloader();
            if (data.status == 'success') {
                //重新拉取用户地址信息，以便获取GUID值
                $.toast(data.html);
            }
            else {
                $.toast(data.html);
            }
            $.router.back();
            return true;
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            $.hidePreloader();
            $.toast("状态:" + textStatus + "\r\n" + "信息:" + errorThrown);
            return false;//Flag
        },
    });
};

//提交前验证表单
function CheckInfo() {
    var Name = $("#LinkMan").val();
    var Phone = $("#LinkManPhone").val();
    var Street = $("#DetailLocation").val();

    //验证联系人为空
    if (Name == "") {
        $.alert("请输入联系人");
        return false;
    }
    //验证手机号码
    var regx = /^1[34578]\d{9}$/;
    var rs = regx.exec(Phone);
    if (!rs) {
        $.alert("请输入有效的手机号码")
        return false;
    }
    //验证街道长度
    if (!(Street.length >= 5)) {
        $.alert("街道名称需大于5个字符");
        return false;
    }
    return true;
};

//获取用户地址列表
function GetUserAddressInfoList() {
    if (!IsOnLine()) { return false; }
    $.showPreloader('请稍后...')
    $.ajax({
        url: WebSiteName + "/AddressPage/GetUserAddressListInfo?UserID=123456",
        type: "POST",
        cache: false,
        timeout: 8000,
        success: function (data) {
            if (data.status == 'success') {
                //重新拉取用户地址信息，以便获取GUID值
                if (data.html != null) {
                    $("#AddressListInfo").empty();
                    $("#AddressListInfo").append(data.html);
                }
            }
            else {
                $.toast(data.html);
            }
            $.hidePreloader();
            return false;//Flag
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
        },
    });
};

//编辑用户地址列表
function EditAddressInfo(AddressID) {
    if (!IsOnLine()) { return false; }
    $.showPreloader('请稍后...')
    $.ajax({
        url: WebSiteName + "/AddressPage/GetSingleAddressInfo?AddressID=" + AddressID,
        type: "POST",
        cache: false,
        timeout: 8000,
        success: function (data) {
            if (data.status == 'success') {
                //重新赋值表单 并跳转页面
                if (data.html != null) {
                    $.hidePreloader();
                    $("#LinkMan").val(data.html.LinkMan);
                    $("#LinkManPhone").val(data.html.LinkManPhone);
                    $("#BackUpPhone").val(data.html.BackUpPhone);
                    $("#Location").val(data.html.Location);
                    $("#DetailLocation").val(data.html.DetailLocation);
                    $("#PostCode").val(data.html.PostCode);
                    $.router.load("#AddAddressPage");

                }
            }
            else {
                $.toast(data.html);
            }
            return false;//Flag
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
        },
    });
};
//移除用户地址
function DeletaUserAddress(AddressID, AddressInfo) {
    $.confirm(AddressInfo, '确定移除此地址？', function () {
        if (!IsOnLine()) { return false; }
        $.showPreloader('请稍后...')
        $.ajax({
            url: WebSiteName + "/AddressPage/GetSingleAddressInfo?AddressID=" + AddressID,
            type: "POST",
            cache: false,
            timeout: 8000,
            success: function (data) {
                if (data.status == 'success') {
                    //重新赋值表单 并跳转页面
                    if (data.html != null) {
                        $.hidePreloader();
                        $("#LinkMan").val(data.html.LinkMan);
                        $("#LinkManPhone").val(data.html.LinkManPhone);
                        $("#BackUpPhone").val(data.html.BackUpPhone);
                        $("#Location").val(data.html.Location);
                        $("#DetailLocation").val(data.html.DetailLocation);
                        $("#PostCode").val(data.html.PostCode);
                        $.router.load("#AddAddressPage");

                    }
                }
                else {
                    $.toast(data.html);
                }
                return false;//Flag
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
            },
        });
    });
}