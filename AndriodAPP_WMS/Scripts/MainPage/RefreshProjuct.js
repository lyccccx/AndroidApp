var loading = false;
var loading2 = false;
var loading3 = false;
// 最多可加载的条目
var maxItems = 100;

// 每次加载添加多少条目
var itemsPerLoad = 4;

function addItems(number, lastIndex) {
	// 生成新条目的HTML
	var html = '';
	for(var i = 0; i <= number; i++) {
		//		html += '<li class="item-content"><div class="item-inner"><div class="item-title">Item ' + i + '</div></div></li>';

		html += "<table><tr><td><div class='card demo-card-header-pic'><div valign='bottom' class='card-header color-white no-border no-padding'><img class='card-cover' src='https://img6.bdstatic.com/img/image/smallpic/666.jpg' alt=''></div><div class='card-content'><div class='card-content-inner'><!--<p class='color-gray'>发表于 2015/01/15</p>-->此处是内容...</div></div><div class='card-footer'><a href='#' class='link'>$66.66</a><a href='#' class='link'>加入购物车</a></div></div></td><td><div class='card demo-card-header-pic'><div valign='bottom' class='card-header color-white no-border no-padding'><img class='card-cover' src='https://img6.bdstatic.com/img/image/smallpic/666.jpg' alt=''></div><div class='card-content'><div class='card-content-inner'><!--<p class='color-gray'>发表于 2015/01/15</p>-->此处是内容...</div></div><div class='card-footer'><a href='#' class='link'>$66.66</a><a href='#' class='link'>加入购物车</a></div></div></td></tr><tr><td><div class='card demo-card-header-pic'><div valign='bottom' class='card-header color-white no-border no-padding'><img class='card-cover' src='https://img6.bdstatic.com/img/image/smallpic/666.jpg' alt=''></div><div class='card-content'><div class='card-content-inner'><!--<p class='color-gray'>发表于 2015/01/15</p>-->此处是内容...</div></div><div class='card-footer'><a href='#' class='link'>$66.66</a><a href='#' class='link'>加入购物车</a></div></div></td><td><div class='card demo-card-header-pic'><div valign='bottom' class='card-header color-white no-border no-padding'><img class='card-cover' src='https://img6.bdstatic.com/img/image/smallpic/666.jpg' alt=''></div><div class='card-content'><div class='card-content-inner'><!--<p class='color-gray'>发表于 2015/01/15</p>-->此处是内容...</div></div><div class='card-footer'><a href='#' class='link'>$66.66</a><a href='#' class='link'>加入购物车</a></div></div></td></tr></table>"
	}
	// 添加新条目
	$('.infinite-scroll-bottom .list-container').append(html);

}
//预先加载20条
addItems(itemsPerLoad, 0); // 上次加载的序号

var lastIndex = 4;

// 注册'infinite'事件处理函数
$(document).on('infinite', '.infinite-scroll-bottom', function() {

	// 如果正在加载，则退出
	if(loading) return;

	// 设置flag
	loading = true;

	// 模拟1s的加载过程
	setTimeout(function() {
		// 重置加载flag
		loading = false;

		if(lastIndex >= maxItems) {
			// 加载完毕，则注销无限加载事件，以防不必要的加载
			$.detachInfiniteScroll($('.infinite-scroll'));
			// 删除加载提示符
			$('.infinite-scroll-preloader').remove();
			return;
		}

		// 添加新条目
		addItems(itemsPerLoad, lastIndex);
		// 更新最后加载的序号
		lastIndex = $('.list-container li').length;
		//容器发生改变,如果是js滚动，需要刷新滚动
		$.refreshScroller();
	}, 1000);
});