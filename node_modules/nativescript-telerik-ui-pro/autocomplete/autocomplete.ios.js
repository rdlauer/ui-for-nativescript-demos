var viewModule = require("ui/core/view");
var commonModule = require("./autocomplete-common");
var utilsModule = require("utils/utils");
var builder = require("ui/builder");
require("utils/module-merge").merge(commonModule, exports);
var knownTemplates;
(function (knownTemplates) {
    knownTemplates.suggestionItemTemplate = "suggestionItemTemplate";
})(knownTemplates = exports.knownTemplates || (exports.knownTemplates = {}));
var SuggestionView = (function (_super) {
    __extends(SuggestionView, _super);
    function SuggestionView(parent) {
        _super.call(this);
        this._realizedCells = new Map();
    }
    Object.defineProperty(SuggestionView.prototype, "ios", {
        get: function () {
            return this._ios;
        },
        set: function (value) {
            this._ios = value;
        },
        enumerable: true,
        configurable: true
    });
    SuggestionView.prototype.onSuggestionViewHeightChanged = function (data) {
        this._ios.suggestionViewHeight = data.newValue;
    };
    SuggestionView.prototype.onSuggestionItemTemplateChanged = function (data) {
        this._ios.suggestionViewHeight = data.newValue;
    };
    return SuggestionView;
})(commonModule.SuggestionView);
exports.SuggestionView = SuggestionView;
var SuggestionViewCell = (function (_super) {
    __extends(SuggestionViewCell, _super);
    function SuggestionViewCell() {
        _super.apply(this, arguments);
    }
    SuggestionViewCell.new = function () {
        var instance = _super.new.call(this);
        return instance;
    };
    SuggestionViewCell.class = function () {
        return SuggestionViewCell;
    };
    SuggestionViewCell.prototype.systemLayoutSizeFittingSize = function (targetSize) {
        var dimensions = this.layoutCell(this, undefined);
        return CGSizeMake(dimensions.measuredWidth, dimensions.measuredHeight);
    };
    SuggestionViewCell.prototype.layoutCell = function (cell, indexPath) {
        var itemViewDimensions = this.measureCell(this.view.itemView, indexPath);
        var cellView = this.view.itemView;
        viewModule.View.layoutChild(this.owner, cellView, 0, 0, itemViewDimensions.measuredWidth, itemViewDimensions.measuredHeight);
        return itemViewDimensions;
    };
    SuggestionViewCell.prototype.measureCell = function (cellView, sizeRestriction) {
        if (cellView) {
            var itemWidth = this.owner.getMeasuredWidth();
            var itemHeight = undefined;
            if (sizeRestriction !== undefined) {
                itemWidth = sizeRestriction.width;
                itemHeight = sizeRestriction.height;
            }
            var heightSpec, widthSpec;
            if (itemHeight === undefined) {
                heightSpec = utilsModule.layout.makeMeasureSpec(0, utilsModule.layout.UNSPECIFIED);
            }
            else {
                heightSpec = utilsModule.layout.makeMeasureSpec(itemHeight, utilsModule.layout.EXACTLY);
            }
            widthSpec = utilsModule.layout.makeMeasureSpec(itemWidth, utilsModule.layout.EXACTLY);
            return viewModule.View.measureChild(this.owner, cellView, widthSpec, heightSpec);
        }
        return undefined;
    };
    return SuggestionViewCell;
})(TKListViewCell);
var TokenModel = (function (_super) {
    __extends(TokenModel, _super);
    function TokenModel(text, image) {
        _super.call(this, text, image);
        this._ios = new TKAutoCompleteToken(NSString.stringWithCString(text));
        if (image) {
            if (image.startsWith("res://")) {
                var name = image.substring(6, image.length);
                this._ios.image = UIImage.imageNamed(name);
            }
            else {
                this._ios.image = UIImage.imageNamed(image);
            }
        }
    }
    Object.defineProperty(TokenModel.prototype, "ios", {
        get: function () {
            return this._ios;
        },
        enumerable: true,
        configurable: true
    });
    return TokenModel;
})(commonModule.TokenModel);
exports.TokenModel = TokenModel;
var CompletionModeImpl = (function () {
    function CompletionModeImpl() {
    }
    CompletionModeImpl.new = function () { };
    CompletionModeImpl.StartsWith = function (input, suggestions, owner) {
        var result = new NSMutableArray();
        var nsResult = new Array();
        for (var i = 0; i < suggestions.length; i++) {
            var current = suggestions.getItem(i);
            var upperCase = current.ios.text.toUpperCase();
            if (upperCase.startsWith(input.toUpperCase())) {
                result.addObject(current.ios);
                nsResult.push(current);
            }
        }
        owner.filteredItems = nsResult;
        return result;
    };
    CompletionModeImpl.Contains = function (input, suggestions, owner) {
        var result = new NSMutableArray();
        var nsResult = new Array();
        for (var i = 0; i < suggestions.length; i++) {
            var current = suggestions.getItem(i);
            var upperCase = current.ios.text.toUpperCase();
            if (upperCase.indexOf(input.toUpperCase()) != -1) {
                result.addObject(current.ios);
                nsResult.push(current);
            }
        }
        owner.filteredItems = nsResult;
        return result;
    };
    return CompletionModeImpl;
})();
//suggestion view data source
var SuggestionViewDataSourceImpl = (function (_super) {
    __extends(SuggestionViewDataSourceImpl, _super);
    function SuggestionViewDataSourceImpl() {
        _super.apply(this, arguments);
    }
    SuggestionViewDataSourceImpl.new = function () {
        return _super.new.call(this);
    };
    SuggestionViewDataSourceImpl.prototype.initWithOwner = function (owner) {
        this._owner = owner;
        return this;
    };
    SuggestionViewDataSourceImpl.prototype.listViewNumberOfItemsInSection = function (listView, section) {
        return this._owner.suggestionView.ios.items ? this._owner.suggestionView.ios.items.count : 0; //todo: update to support custom DataSource object from owner
    };
    SuggestionViewDataSourceImpl.prototype.listViewCellForItemAtIndexPath = function (listView, indexPath) {
        var cell = listView.dequeueReusableCellWithReuseIdentifierForIndexPath("defaultCell", indexPath);
        if (!cell.owner) {
            cell.backgroundView.stroke = null;
            cell.selectedBackgroundView.stroke = null;
            cell.offsetContentViewInMultipleSelection = false;
            cell.owner = this._owner;
            var template = new Object();
            template.itemView = builder.parse(this._owner.suggestionView.suggestionItemTemplate, undefined);
            cell.view = template;
            cell.contentView.addSubview(template.itemView.ios);
        }
        cell.view.itemView.bindingContext = this._owner.filteredItems[indexPath.row];
        return cell;
    };
    SuggestionViewDataSourceImpl.prototype.numberOfSectionsInListView = function (listView) {
        return 1;
    };
    SuggestionViewDataSourceImpl.ObjCProtocols = [TKListViewDataSource];
    return SuggestionViewDataSourceImpl;
})(NSObject);
// AutoCompleteDataSource
var AutoCompleteDataSourceImpl = (function (_super) {
    __extends(AutoCompleteDataSourceImpl, _super);
    function AutoCompleteDataSourceImpl() {
        _super.apply(this, arguments);
        this.currentCompletionMode = CompletionModeImpl.StartsWith;
    }
    AutoCompleteDataSourceImpl.new = function () {
        return _super.new.call(this);
    };
    AutoCompleteDataSourceImpl.prototype.initWithOwner = function (owner) {
        this._owner = owner;
        return this;
    };
    AutoCompleteDataSourceImpl.prototype.autoCompleteCompletionForPrefix = function (autocomplete, prefix) {
        var suggestions = new NSMutableArray();
        if (prefix == "") {
            this._owner.ios.suggestionView.hide();
            return suggestions;
        }
        else {
            return this.currentCompletionMode(prefix, this._owner.items, this._owner);
        }
    };
    AutoCompleteDataSourceImpl.ObjCProtocols = [TKAutoCompleteDataSource];
    return AutoCompleteDataSourceImpl;
})(NSObject);
//AutoCompleteDelagate
var AutoCompleteDelegateImpl = (function (_super) {
    __extends(AutoCompleteDelegateImpl, _super);
    function AutoCompleteDelegateImpl() {
        _super.apply(this, arguments);
    }
    AutoCompleteDelegateImpl.new = function () {
        return _super.new.call(this);
    };
    AutoCompleteDelegateImpl.prototype.initWithOwner = function (owner) {
        this._owner = owner;
        this._firstInput = true;
        return this;
    };
    AutoCompleteDelegateImpl.prototype.autoCompleteWillShowSuggestionList = function (autocomplete, suggestionList) {
        var args = { eventName: commonModule.RadAutoCompleteTextView.suggestionViewBecameVisibleEvent, object: this._owner, returnValue: true };
        this._owner.notify(args);
    };
    AutoCompleteDelegateImpl.prototype.autoCompleteDidAddToken = function (autocomplete, token) {
        var args = { eventName: commonModule.RadAutoCompleteTextView.tokenAddedEvent, object: this._owner, returnValue: true };
        this._owner.notify(args);
    };
    AutoCompleteDelegateImpl.prototype.autoCompleteDidRemoveToken = function (autocomplete, token) {
        var args = { eventName: commonModule.RadAutoCompleteTextView.tokenRemovedEvent, object: this._owner, returnValue: true };
        this._owner.notify(args);
    };
    AutoCompleteDelegateImpl.prototype.autoCompleteDidSelectToken = function (autocomplete, token) {
        var args = { eventName: commonModule.RadAutoCompleteTextView.tokenSelectedEvent, object: this._owner, returnValue: true };
        this._owner.notify(args);
    };
    AutoCompleteDelegateImpl.ObjCProtocols = [TKAutoCompleteDelegate];
    return AutoCompleteDelegateImpl;
})(NSObject);
var RadAutoCompleteTextView = (function (_super) {
    __extends(RadAutoCompleteTextView, _super);
    function RadAutoCompleteTextView() {
        _super.call(this);
        this.filteredItems = new Array();
        this._ios = TKAutoCompleteTextView.new();
        this._ios.minimumCharactersToSearch = 1;
        this._dataSource = AutoCompleteDataSourceImpl.new().initWithOwner(this);
        this._dataSource.currentCompletionMode = CompletionModeImpl.StartsWith;
        this._ios.suggestionView.registerClassForCellWithReuseIdentifier(SuggestionViewCell.class(), "defaultCell");
        this._suggestionViewDataSource = SuggestionViewDataSourceImpl.new().initWithOwner(this);
        this._ios.suggestionView.dataSource = this._suggestionViewDataSource;
        this._ios.dataSource = this._dataSource;
        this._delegate = AutoCompleteDelegateImpl.new().initWithOwner(this);
        this._ios.delegate = this._delegate;
    }
    Object.defineProperty(RadAutoCompleteTextView.prototype, "ios", {
        get: function () {
            return this._ios;
        },
        enumerable: true,
        configurable: true
    });
    RadAutoCompleteTextView.prototype.resetAutocomplete = function () {
        this._ios.resetAutocompleteState();
    };
    RadAutoCompleteTextView.prototype.addToken = function (token) {
        var native = new TKAutoCompleteToken(NSString.stringWithCString(token.text));
        this._ios.addToken(native);
    };
    RadAutoCompleteTextView.prototype.insertTokenAtIndex = function (token, index) {
        var native = new TKAutoCompleteToken(NSString.stringWithCString(token.text));
        this._ios.insertTokenAtIndex(native, index);
    };
    RadAutoCompleteTextView.prototype.removeToken = function (token) {
        var native = new TKAutoCompleteToken(NSString.stringWithCString(token.text));
        this._ios.insertTokenAtIndex(native);
    };
    RadAutoCompleteTextView.prototype.removeTokenAtIndex = function (index) {
        this._ios.removeTokenAtIndex(index);
    };
    RadAutoCompleteTextView.prototype.removeAllTokens = function () {
        this._ios.removeAllTokens();
    };
    RadAutoCompleteTextView.prototype.tokens = function () {
        return this._ios.tokens;
    };
    RadAutoCompleteTextView.prototype.tokenAtIndex = function (index) {
        return this._ios.tokenAtIndex(index);
    };
    RadAutoCompleteTextView.prototype.onDisplayModeChanged = function (data) {
        this.adjustDisplayMode(data.newValue);
    };
    RadAutoCompleteTextView.prototype.onLayoutModeChanged = function (data) {
        this.adjustLayoutMode(data.newValue);
    };
    RadAutoCompleteTextView.prototype.onSuggestModeChanged = function (data) {
        this.adjustSuggestMode(data.newValue);
    };
    RadAutoCompleteTextView.prototype.onCompletionModeChanged = function (data) {
        this.adjustCompletionMode(data.newValue);
    };
    RadAutoCompleteTextView.prototype.onSuggestionViewChanged = function (data) {
        var suggestionView = data.newValue;
        suggestionView.ios = this._ios.suggestionView;
        this._ios.suggestionViewHeight = suggestionView.suggestionViewHeight;
        this._ios.suggestionView.reloadData();
    };
    RadAutoCompleteTextView.prototype.onMinimumCharactersToSearchChanged = function (data) {
        this._ios.minimumCharactersToSearch = data.newValue;
    };
    RadAutoCompleteTextView.prototype.adjustCompletionMode = function (value) {
        if (this._ios && value) {
            if (value == commonModule.CompletionMode.StartsWith) {
                this._dataSource.currentCompletionMode = CompletionModeImpl.StartsWith;
            }
            else {
                this._dataSource.currentCompletionMode = CompletionModeImpl.Contains;
            }
        }
    };
    RadAutoCompleteTextView.prototype.adjustDisplayMode = function (value) {
        if (this._ios && value) {
            this._ios.displayMode = (value === commonModule.DisplayMode.Plain) ?
                TKAutoCompleteDisplayModePlain :
                TKAutoCompleteDisplayModeTokens;
        }
    };
    RadAutoCompleteTextView.prototype.adjustSuggestMode = function (value) {
        if (this._ios && value) {
            if (value == commonModule.SuggestMode.Suggest) {
                this.ios.suggestMode = TKAutoCompleteSuggestModeSuggest;
            }
            else if (value == commonModule.SuggestMode.Append) {
                this.ios.suggestMode = TKAutoCompleteSuggestModeAppend;
            }
            else {
                this.ios.suggestMode = TKAutoCompleteSuggestModeSuggestAppend;
            }
        }
    };
    RadAutoCompleteTextView.prototype.adjustLayoutMode = function (value) {
        if (value && this._ios) {
            this._ios.layoutMode = (value === commonModule.LayoutMode.Horizontal) ?
                TKAutoCompleteLayoutModeHorizontal :
                TKAutoCompleteLayoutModeWrap;
        }
    };
    return RadAutoCompleteTextView;
})(commonModule.RadAutoCompleteTextView);
exports.RadAutoCompleteTextView = RadAutoCompleteTextView;
