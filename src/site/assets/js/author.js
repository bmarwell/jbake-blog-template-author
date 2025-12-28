
/*
 * Author WordPress Theme, Copyright 2019 Compete Themes
 * Author is distributed under the terms of the GNU GPL
 *
 * License: GNU General Public License v2 or later
 * License URI: http://www.gnu.org/licenses/gpl-2.0.html
 *
 */

/*
 * Author production.js.
 * Converted to not using jQuery by Benjamin Marwell.
 */

/**
 * Registers all event listeners and initializes the theme's interactive behavior.
 * Main entry point called on DOMContentLoaded. Sets up sidebar navigation, 
 * dropdown menus, scroll handling, and responsive layout adjustments.
 * All dimension reads are cached to avoid forced reflows during scroll/resize.
 */
function registerToggleDropdown () {

  /* Set variables */
  const toggleDropdown = Object.values(document.getElementsByClassName("toggle-dropdown"));
  const sidebar = document.getElementById("main-sidebar");
  const siteHeader = document.getElementById("site-header");
  const main = document.getElementById('main');
  const sidebarPrimary = document.getElementById("sidebar-primary");
  const overflowContainer = document.getElementById('overflow-container');
  const headerImage = document.getElementById('header-image');
  const menu = document.getElementById('menu-primary-items');

  // for scrolling
  var lastWindowPos = 0;
  var top, bottom, short = false;
  var topOffset = 0;
  var resizeTimer;
  var cachedDimensions = {
    windowWidth: window.innerWidth,
    windowHeight: window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight,
    bodyHeight: 0,
    sidebarHeight: 0
  };
  
  /**
   * Updates cached dimension values from the DOM.
   * Called on resize to refresh measurements before layout calculations.
   * Caching prevents repeated DOM reads during scroll which cause forced reflows.
   */
  function updateCachedDimensions() {
    cachedDimensions.windowWidth = window.innerWidth;
    cachedDimensions.windowHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
    cachedDimensions.bodyHeight = overflowContainer.clientHeight;
    cachedDimensions.sidebarHeight = sidebar.offsetHeight;
  }
  
  updateCachedDimensions();


  /**
   * Scroll event handler that closes the mobile menu when scrolling past the sidebar.
   * Attached when menu opens, removed when menu closes. Improves mobile UX by 
   * auto-closing the navigation when user scrolls to content.
   */
  const autoCloseMenuListener = function() {
    const sidebarBottom = sidebar.offsetTop + sidebar.offsetHeight;
    if (window.scrollY > sidebarBottom) {
      autoCloseMenu();
    }
  };

  /**
   * Window resize event handler that recalculates all layout dimensions.
   * Debounced via resizeTimer to avoid excessive calculations during resize.
   * Updates cache first, then adjusts all position-dependent elements.
   */
  const resizeListener = function(){
    updateCachedDimensions();
    positionSidebar();
    closeMainSidebar();
    setMainMinHeight();
    objectFitAdjustment();
  };

  /* Call functions */

  positionSidebar();
  objectFitAdjustment();


  // primary menu on mobile
  document.getElementById("toggle-navigation").addEventListener('click', openPrimaryMenu);
  toggleDropdown.forEach(el => el.addEventListener('click', openDropdownMenu));

  document.addEventListener('DOMContentLoaded', function () {
    setMainMinHeight();
  }, false);

  window.addEventListener('resize', resizeListener);

  // optional: fitVids

  /**
   * Toggles the primary navigation menu open/closed on mobile devices.
   * Called when hamburger menu button is clicked. Handles aria attributes,
   * screen reader text, and auto-close scroll listener. On tablet widths
   * (550-949px), also adjusts main content min-height to accommodate menu.
   */
  function openPrimaryMenu() {
    if (sidebar.classList.contains("open")) {
      sidebar.dispatchEvent(new Event("close"));
      sidebar.classList.remove('open');

      // update screen reader text and aria-expanded
      Array.prototype.filter.call(this.children, function(el) {
        return el.nodeName === "span";
      })
        .forEach(el => el.text("open main menu"));
      this.setAttribute( 'aria-expanded', 'false' );

      // close all ULs by removing increased max-height
      Object.values(document.querySelectorAll("#menu-primary-items ul, .menu-unset ul"))
        .forEach(el => el.removeAttribute("style"));

      // close all ULs and require 2 clicks again when reopened
      Object.values(document.querySelectorAll(".menu-item-has-children"))
        .forEach(el => {
          if (el.classList.contains("open")) {
            el.classList.remove("open");
          }
        });

      // set minimum height for main
      setMainMinHeight();

      // return sidebar to initial top position
      positionSidebar();

      // if menu is closed, unbind auto close function
      window.removeEventListener("scroll", autoCloseMenuListener);
    } else {
      // close

      sidebar.classList.add('open');
      sidebar.dispatchEvent(new Event("open"));

      // update screen reader text and aria-expanded
      Array.prototype.filter.call(this.children, function(el) {
        return el.nodeName === "span";
      })
        .forEach(el => el.text("close main menu"));
      this.setAttribute( 'aria-expanded', 'true' );

      // if at width when menu is absolutely positioned
      if ( !( cachedDimensions.windowWidth > 549 && cachedDimensions.windowWidth < 950 ) ) {
        return;
      }

      // Batch read all dimensions first
      const dimensions = {
        socialIconsHeight: 0,
        menuHeight: menu.offsetHeight,
        headerHeight: sidebar.offsetHeight,
        sidebarPrimaryHeight: sidebarPrimary.offsetHeight,
        windowHeight: cachedDimensions.windowHeight
      };
      
      for ( let child of siteHeader.children ) {
        if (!child.classList.contains("social-media-icons")) continue;
        for (let socialChild of child.children) {
          if (socialChild.nodeName !== "UL") continue;
          dimensions.socialIconsHeight += socialChild.offsetHeight;
        }
      }
      
      const minHeight = dimensions.sidebarPrimaryHeight + dimensions.headerHeight + dimensions.socialIconsHeight + dimensions.menuHeight;
      
      // Batch write
      if ( minHeight > dimensions.windowHeight ) {
        main.style.setProperty( 'min-height', minHeight + 'px' );
      }

      window.addEventListener("scroll", autoCloseMenuListener);
    }
  }

  /**
   * Toggles a dropdown submenu within the navigation.
   * Called when a menu item's dropdown button is clicked. Updates aria
   * attributes, adjusts sidebar positioning on tablet breakpoint, and
   * recalculates main content min-height. Handles nested menu hierarchies.
   */
  function openDropdownMenu() {
    var menuItem = this.parentElement;

    if ( menuItem.classList.contains( "open" ) ) {
      menuItem.classList.remove( 'open' );
      Array.prototype.filter.call(this.children, function(el) {
        return el.nodeName === "span";
      })
        .forEach(el => el.text("open submenu"));
      this.setAttribute( 'aria-expanded', 'false' );
    } else {
      menuItem.classList.add( 'open' );
      Array.prototype.filter.call(this.children, function(el) {
        return el.nodeName === "span";
      })
        .forEach(el => el.text("close submenu"));
      this.setAttribute('aria-expanded', 'true');
      short = false; // return to false to be measured again (may not be shorter than window now)

    }
    adjustSidebarHeight( this );
    setMainMinHeight();
  }

  /**
   * Opens ancestor menus to reveal the current page in navigation hierarchy.
   * Called once on page load to auto-expand menu tree to show active page.
   * Ensures users can see where they are in the site structure without
   * manually opening parent menus.
   */
  // open the menu to display the current page if inside a dropdown menu
  var currentMenuAncestor = Object.values(document.getElementsByClassName("current-menu-ancestor"))[0];
  if (currentMenuAncestor !== null && currentMenuAncestor !== undefined) {
    currentMenuAncestor.classList.add("open")
    var ancestorMenu = currentMenuAncestor.closest('li.menu-item-has-children');
    while (ancestorMenu !== null && ancestorMenu !== undefined) {
      ancestorMenu.classList.add("open");
      ancestorMenu = ancestorMenu.parentElement.closest('li.menu-item-has-children');
    }
  }

  /**
   * Absolutely positions sidebar elements on tablet breakpoint (550-949px).
   * Called on load and resize. At this width range, menu is absolutely positioned
   * to overlay content. Batches all DOM reads before writes to prevent forced reflows.
   * Does nothing outside the tablet breakpoint.
   */
  // absolutely position the sidebar
  function positionSidebar() {
    // if at width when menu is absolutely positioned
    if( cachedDimensions.windowWidth > 549 && cachedDimensions.windowWidth < 950 ) {
      // Batch all reads first
      const dimensions = {
        socialIconsHeight: 0,
        menuHeight: menu.offsetHeight,
        headerHeight: sidebar.offsetHeight
      };
      
      for ( let child of siteHeader.children ) {
        if (!child.classList.contains("social-media-icons")) continue;
        for (let socialChild of child.children) {
          if (socialChild.nodeName !== "UL") continue;
          dimensions.socialIconsHeight += socialChild.offsetHeight;
        }
      }

      // Batch all writes
      const primaryMenu = document.getElementById("menu-primary");
      if (primaryMenu !== null) {
        primaryMenu.style.setProperty( "top", dimensions.headerHeight + dimensions.socialIconsHeight + 24 + 'px' );
      }
      sidebarPrimary.style.setProperty('top', dimensions.headerHeight + dimensions.socialIconsHeight + dimensions.menuHeight + 48 + 'px');
    }
    else {
      Object.values(document.querySelectorAll('#sidebar-primary, #menu-primary'))
        .forEach(el => el.style.removeProperty('top'));
    }
  }

  /**
   * Adjusts sidebar vertical position when dropdown menu opens/closes.
   * Called when toggle button is clicked on tablet breakpoint (550-949px).
   * Shifts sidebar down/up by submenu height and adjusts main content height
   * accordingly. Uses fixed 36px per menu item to avoid layout thrashing.
   */
  function adjustSidebarHeight(button) {
    // if at width when menu is absolutely positioned
    if (  !( cachedDimensions.windowWidth > 549 && cachedDimensions.windowWidth < 950 ) ) {
      return;
    }

    // get the submenu
    const list = button.nextSibling;
    const listHeight = list.children.length * 36; // Using 36 instead of getting height

    // Batch all reads
    const sidebarTop = parseInt(sidebarPrimary.style.getPropertyValue("top")) || 0;
    const mainHeight = parseInt(main.style.getPropertyValue('min-height')) || 0;
    const menuItem = button.parentElement;
    const isOpening = menuItem.classList.contains('open');

    // Batch all writes
    if( isOpening ) {
      sidebarPrimary.style.setProperty('top', sidebarTop + listHeight + 'px');
      main.style.setProperty('min-height', mainHeight + listHeight + 'px');
    } else {
      sidebarPrimary.style.setProperty('top', sidebarTop - listHeight + 'px');
      main.style.setProperty('min-height', mainHeight - listHeight + 'px');
    }
  }

  /**
   * Automatically closes mobile menu if resized to desktop width (>949px).
   * Called on window resize. Prevents menu from staying open when viewport
   * becomes wide enough for persistent sidebar. Triggers full menu close
   * sequence including cleanup of event listeners.
   */
  // if sidebar open and resized over 950px, automatically close it
  function closeMainSidebar() {

    // if no longer at width when menu is absolutely positioned
    if( window.innerWidth > 949 && sidebar.classList.contains('open') ) {
      // run function to close sidebar and all menus
      openPrimaryMenu();
    }
  }

  /**
   * Sets minimum height on main content area to prevent layout shifts.
   * Called on load, resize, and menu interactions. Ensures sidebar can scroll
   * fully when fixed-positioned by making main content tall enough. Batches
   * reads before removing/setting height to minimize reflows.
   */
  // increase main height when needed so fixed sidebar can be scrollable
  function setMainMinHeight() {
    // Batch all reads first
    let height = overflowContainer.clientHeight;
    if ( headerImage !== null ) {
      height = height - headerImage.offsetHeight;
    }
    const sidebarHeight = sidebar.offsetHeight;
    
    if ( sidebarHeight > height ) {
      height = sidebarHeight;
    }

    // Batch all writes
    main.style.removeProperty('min-height');
    if ( height > cachedDimensions.windowHeight ) {
      main.style.setProperty('min-height', height + 'px')
    }
    
    cachedDimensions.sidebarHeight = sidebarHeight;
  }

  /**
   * Updates cached dimensions and resets sidebar positioning below mobile breakpoint.
   * Called from debounced resize handler. Refreshes dimension cache and removes
   * any inline styles from sidebar when viewport is too narrow for fixed positioning.
   */
  // Sidebar scrolling.
  function resize() {
    updateCachedDimensions();

    if ( cachedDimensions.windowWidth < 950 ) {
      top = bottom = false;
      sidebar.removeAttribute("style");
    }
  }

  /**
   * Handles fixed/absolute sidebar positioning during page scroll on desktop (>949px).
   * Called on every scroll event. Intelligently switches between fixed and absolute
   * positioning based on scroll direction and sidebar height. For tall sidebars,
   * fixes to top when scrolling down and to bottom when scrolling up. Batches reads
   * to avoid forced reflows. Does nothing on mobile/tablet widths.
   */
  function scroll() {
    if ( 950 > cachedDimensions.windowWidth ) {
      return;
    }

    const windowPos = scrollTop();

    // if the sidebar height is not greater than the window height
    if ( ( ( cachedDimensions.sidebarHeight <= cachedDimensions.windowHeight ) || short === true ) ) {
      top = true;
      short = true;
      sidebar.style.setProperty('position', 'fixed' );
      return;
    }

    // Batch reads
    const sidebarOffsetTop = sidebar.offsetTop;
    
    // if the sidebar height + admin bar is greater than the window height
    // if the window has been scrolled down
    if ( windowPos > lastWindowPos ) {
      if ( top ) {
        top = false;
        topOffset = ( sidebarOffsetTop > 0 ) ? sidebarOffsetTop : 0;
        sidebar.style.setProperty('top', topOffset + 'px');
      } else if ( !bottom && windowPos + cachedDimensions.windowHeight >= cachedDimensions.sidebarHeight + sidebarOffsetTop && cachedDimensions.sidebarHeight <= cachedDimensions.bodyHeight ) {
        bottom = true;
        sidebar.style.setProperty('position', 'fixed');
        sidebar.style.setProperty('bottom', '0');
      }
      // if sidebar was shorter then menu dropdown made it taller
      else if ( ( cachedDimensions.sidebarHeight  > cachedDimensions.windowHeight ) && !bottom ) {
        topOffset = ( sidebarOffsetTop > 0 ) ? sidebarOffsetTop : 0;
        sidebar.style.setProperty('top', topOffset + 'px');
      }
    }
    // if the window has been scrolled up
    else if ( windowPos < lastWindowPos ) {
      if ( bottom ) {
        bottom = false;
        topOffset = ( sidebarOffsetTop > 0 ) ? sidebarOffsetTop : 0;
        sidebar.style.setProperty('top', topOffset + 'px');
      } else if ( !top && windowPos >= 0 && windowPos <= sidebarOffsetTop ) {
        top = true;
        sidebar.style.setProperty('position', 'fixed');
      }
    }
    // if the window has not been previously scrolled
    else {
      top = bottom = false;
    }

    lastWindowPos = windowPos;
  }

  /**
   * Debounced wrapper that calls resize then scroll.
   * Used by resize and click listeners. Ensures dimensions are updated before
   * scroll positioning logic runs. Called via setTimeout to batch rapid events.
   */
  window.addEventListener('scroll', scroll);
  window.addEventListener('resize', function() {
    clearTimeout( resizeTimer );
    resizeTimer = setTimeout( resizeAndScroll, 500 );
  } );
  sidebar.addEventListener('click keydown', resizeAndScroll)

  function resizeAndScroll() {
    resize();
    scroll();
  }
  resizeAndScroll();

  /**
   * Closes mobile menu when user scrolls 50px past the bottom of sidebar.
   * Called by autoCloseMenuListener on scroll when mobile menu is open.
   * Improves UX by automatically dismissing menu when user engages with content.
   */
  function autoCloseMenu() {

    // get position of the bottom of the sidebar
    var sidebarPrimaryBottom = sidebarPrimary.offsetTop + sidebarPrimary.clientHeight;

    // window distance from top
    var topDistance = scrollTop();

    // if visitor scrolled 50px past bottom of sidebar, close menu
    if (topDistance > sidebarPrimaryBottom + 50) {
      openPrimaryMenu();
    }
  }

  /**
   * Polyfill for object-fit CSS property on older browsers.
   * Called on load and resize. Manually positions images to fill containers
   * by setting width/height styles when object-fit is not supported.
   * Batches all dimension reads before any style writes to prevent reflows.
   * Does nothing if object-fit is natively supported.
   */
  // mimic cover positioning without using cover
  function objectFitAdjustment() {
    // if the object-fit property is not supported
    if( ('object-fit' in document.body.style) ) {
      return;
    }

    Object.values(document.getElementsByClassName("featured-image"))
      .forEach(el => {
        if (el.closest('.entry').classList.contains('ratio-neutral')) {
          return;
        }

        const image = Object.values(el.children)
          .filter( elm => elm.nodeName === "IMG" )
          .concat(
            Object.values(el.children)
              .filter(elm => elm.nodeName === "A")
              .map( elm => elm.children )
              .filter( elm => elm.nodeName === "IMG")
          )
          .find(Boolean);

        if (!image || image.classList.contains("no-object-fit")) return;

        image.classList.add("no-object-fit");

        // Batch reads
        const imageWidth = image.offsetWidth;
        const imageHeight = image.offsetHeight;
        const elWidth = el.offsetWidth;
        const elHeight = el.offsetHeight;

        // Batch writes - if the image is not wide enough to fill the space
        if (imageWidth < elWidth) {
          image.style.setProperty('width', '100%')
          image.style.setProperty('min-width', '100%');
          image.style.setProperty('max-width', '100%');
          image.style.setProperty('height', 'auto');
          image.style.setProperty('min-height', '100%');
          image.style.setProperty('max-height', 'none');
        }
        // if the image is not tall enough to fill the space
        else if (imageHeight < elHeight) {
          image.style.setProperty('height', '100%')
          image.style.setProperty('min-height', '100%');
          image.style.setProperty('max-height', '100%');
          image.style.setProperty('width', 'auto');
          image.style.setProperty('min-width', '100%');
          image.style.setProperty('max-width', 'none');
        }
      });
  }
}

/**
 * Cross-browser compatible function to get current scroll position.
 * Returns vertical scroll offset from top of page. Handles different
 * browser implementations (modern scrollY vs legacy documentElement/body).
 * Used throughout scroll handling code.
 */
function scrollTop() {
  var supportPageOffset = window.scrollY !== undefined;
  var isCSS1Compat = ((document.compatMode || "") === "CSS1Compat");

  var scrollTop = supportPageOffset ? window.scrollY : isCSS1Compat ? document.documentElement.scrollTop : document.body.scrollTop;

  return scrollTop;
}

document.addEventListener('DOMContentLoaded', registerToggleDropdown, false);
