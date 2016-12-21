// var view = require("ui/core/view");

// exports.pageLoaded = function(args) {
// 	var items = [];
// 	items.push(
// 		{
// 			itemName: "Arcade Fire",
// 			itemDesc: "Funeral",
// 			itemImage: "~/images/arcade-fire.png"
// 		},
// 		{
// 			itemName: "Bon Iver",
// 			itemDesc: "For Emma, Forever Ago",
// 			itemImage: "~/images/bon-iver.png"
// 		},
// 		{
// 			itemName: "Daft Punk",
// 			itemDesc: "Random Access Memories",
// 			itemImage: "~/images/daft-punk.png"
// 		},
// 		{
// 			itemName: "Elbow",
// 			itemDesc: "Build a Rocket Boys!",
// 			itemImage: "~/images/elbow.png"
// 		}
// 	)
// 	var page = args.object;
// 	var listview = view.getViewById(page, "listview");
// 	listview.items = items;
// }



var Observable = require("data/observable").Observable;
var ObservableArray = require("data/observable-array").ObservableArray;

var page;
var items = new ObservableArray([]);
var pageData = new Observable();

exports.pageLoaded = function(args) {
	page = args.object;
	page.bindingContext = pageData;

	items.push(
		{
			itemName: "Arcade Fire",
			itemDesc: "Funeral",
			itemImage: "~/images/arcade-fire.png"
		},
		{
			itemName: "Bon Iver",
			itemDesc: "For Emma, Forever Ago",
			itemImage: "~/images/bon-iver.png"
		},
		{
			itemName: "Daft Punk",
			itemDesc: "Random Access Memories",
			itemImage: "~/images/daft-punk.png"
		},
		{
			itemName: "Elbow",
			itemDesc: "Build a Rocket Boys!",
			itemImage: "~/images/elbow.png"
		}
	)

	pageData.set("items", items);

	setTimeout(function() {
		items.push(
				{
					itemName: "LCD Soundsystem",
					itemDesc: "This is Happening",
					itemImage: "~/images/lcd-soundsystem.png"
				}
		);
	}, 2000);
};

exports.pullToRefreshInitiated = function() {
	setTimeout(function() {
		items.push(
				{
					itemName: "LCD Soundsystem",
					itemDesc: "This is Happening",
					itemImage: "~/images/lcd-soundsystem.png"
				}
		);
		page.getViewById("listview").notifyPullToRefreshFinished();
	}, 2000);
};