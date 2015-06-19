/**
 * Overflow Tabs v1.10
 * Extends jQuery UI Tabs.
 * 
 * This plugin will automatically detect the available space in a tabs container
 * and then determine if all of the tabs will fit, any tab that cannot fit in the
 * container on a single row will be grouped together in an 'overflow' drop down.
 * 
 * The tabs are automatically updated when the page resizes and can be updated manually
 * by running:
 * 
 * 			$("#tabs").tabs("refresh");
 * 
 * Initialising the overflow tabs can be done by simply adding an extra option
 * when loading the jQuery ui tabs:
 * 
 * 			var tabs = $('#tabs').tabs({
 * 				overflowTabs: true
 * 			});
 * 
 * Released under the MIT license:
 *   http://www.opensource.org/licenses/mit-license.php
 */
$.widget("ui.tabs", $.ui.tabs, {
	options: {
		overflowTabs: false,
		tabPadding: 25,
		containerPadding: 0,
		dropdownSize: 50
	},
	
	_create: function() {
		this._super("_create");
		this.tabsWidth = 0;
		this.containerWidth = 0;
		
		if (!this.options.overflowTabs)
			return;
		
		// update the tabs
		this.updateOverflowTabs();
		
		// Detect a window resize and check the tabs again
		var that = this;
		$(window).resize(function() {
			// Add a slight delay after resize, to fix Maximise issue.
			setTimeout(function() {
				that.updateOverflowTabs();
			}, 150);
		});
		
		// Detect dropdown click
		$(this.element).on('click', '.overflow-selector', function() {
			that.toggleList();
		});
	},
	
	refresh: function() {
		this._super("refresh");
		this.updateOverflowTabs();
	},
	
	visible: function(tab, after) {
		if (after === undefined)
			$(this.element).find('ul:first').prepend($(tab));
		else
			$(this.element).find('.last-fixed-tab:first').after($(tab));
			
		this.toggleList();
	},
	
	toggleList: function() {
		if ($(this.element).find('.ui-tabs-overflow:first').hasClass('hide')) {
			$(this.element).find('.ui-tabs-overflow:first').removeClass('hide');
		} else {
			$(this.element).find('.ui-tabs-overflow:first').addClass('hide');
		}
	},
	
	updateOverflowTabs: function() {
		var failsafe = 0;
		this._calculateWidths();
		
		// Loop until tabsWidth is less than the containerWidth
		while (this.tabsWidth > this.containerWidth && failsafe < 30)
		{
			this._hideTab();
			this._calculateWidths();
			failsafe++;
		}
		
		// Finish now if there are no tabs in the overflow list
		if ($(this.element).find('.ui-tabs-overflow:first li').size() == 0)
			return;
			
		// Reset
		failsafe = 0;
		
		// Get the first tab in the overflow list
		var next = this._nextTab();

		// Loop until we cannot fit any more tabs
		while (next.totalSize < this.containerWidth && $(this.element).find('.ui-tabs-overflow:first li').size() > 0 && failsafe < 30)
		{
			next.tab.appendTo($(this.element).find('.ui-tabs-nav:first'));
			this._calculateWidths();
			
			next = this._nextTab();

			failsafe++;
		}
		
		// Check to see if overflow list is now empty
		if ($(this.element).find('.ui-tabs-overflow:first li').size() == 0)
		{
			$(this.element).find('.ui-tabs-overflow:first').remove();
			$(this.element).find('.overflow-selector:first').remove();
		}
	},
	
	_calculateWidths: function() {
		var width = 0;
		$(this.element).find('.ui-tabs-nav:first > li').each(function(){
			width += $(this).outerWidth(true);
		});
		
		this.tabsWidth = width;
		this.containerWidth = $(this.element).parent().width() - this.options.containerPadding - this.options.dropdownSize;
		
		$(this.element).find('.overflow-selector:first .total').html($(this.element).find('.ui-tabs-overflow:first li').size());
	},
	
	_hideTab: function() {
		if (!$(this.element).find('.ui-tabs-overflow').length)
		{
			$(this.element).find('.ui-tabs-nav:first').after('<ul class="ui-tabs-overflow hide"></ul>');
			$(this.element).find('.ui-tabs-overflow:first').after('<div class="overflow-selector">&#8595 <span class="total">0</span></div>');
		}

		var lastTab = $(this.element).find('.ui-tabs-nav:first li').last();
		lastTab.prependTo($(this.element).find('.ui-tabs-overflow:first'));
	},
	
	_nextTab: function() {
		var result = {};
		var firstTab = $(this.element).find('.ui-tabs-overflow:first li').first();
		
		result['tab'] = firstTab;
		result['totalSize'] = this.tabsWidth + this._textWidth(firstTab) + this.options.tabPadding;
		
		return result;
	},

	_textWidth: function(element) {
		var self = $(element),
			children = self.children(),
			calculator = $('<span style="display: inline-block;" />'),
			width;

		children.wrap(calculator);
		width = children.parent().width();
		children.unwrap();
		
		return width;
	}
});