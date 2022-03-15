
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

document.addEventListener('DOMContentLoaded', registerToggleDropdown, false);

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
  var windowWidth   = window.innerWidth;
  var windowHeight  = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
  var bodyHeight    = overflowContainer.clientHeight;
  var sidebarHeight = sidebar.offsetHeight;


  const autoCloseMenuListener = function() {
    if (window.scrollY > (sidebar.offsetTop + sidebar.offsetHeight)) {
      autoCloseMenu();
    }
  };

  const resizeListener = function(){
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

      var windowWidth = window.innerWidth;

      // if at width when menu is absolutely positioned
      if ( !( windowWidth > 549 && windowWidth < 950 ) ) {
        return;
      }

      var socialIconsHeight = 0;
      for ( let child of siteHeader.children ) {
        if (!child.classList.contains("social-media-icons")) continue;

        for (let socialChild of child.children) {
          if (socialChild.nodeName !== "UL") continue;
          socialIconsHeight += socialChild.offsetHeight;
        }
      }
      var menuHeight = menu.offsetHeight;
      var headerHeight = sidebar.offsetHeight;
      var sidebarPrimaryHeight = sidebarPrimary.height;
      var minHeight = sidebarPrimaryHeight + headerHeight + socialIconsHeight + menuHeight;
      if ( minHeight > window.innerHeight ) {
        main.style.setProperty( 'min-height', minHeight + 'px' );
      }

      window.addEventListener("scroll", autoCloseMenuListener);
    }
  }

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

  // open the menu to display the current page if inside a dropdown menu
  var currentMenuAncestor = document.getElementById('current-menu-ancestor')
  if (currentMenuAncestor !== null) {
    currentMenuAncestor.classList.add("open")
  }

  // absolutely position the sidebar
  function positionSidebar() {

    var windowWidth = window.innerWidth;

    // if at width when menu is absolutely positioned
    if( windowWidth > 549 && windowWidth < 950 ) {

      var socialIconsHeight = 0;
      for ( let child of siteHeader.children ) {
        if (!child.classList.contains("social-media-icons")) continue;

        for (let socialChild of child.children) {
          if (socialChild.nodeName !== "UL") continue;
          socialIconsHeight += socialChild.offsetHeight;
        }
      }

      var menuHeight = menu.offsetHeight;
      var headerHeight = sidebar.offsetHeight;

      const primaryMenu = document.getElementById("menu-primary");
      if (primaryMenu !== null) {
        primaryMenu.style.setProperty( "top", headerHeight + socialIconsHeight + 24 + 'px' );
      }

      // below the header and menu + 24 for margin
      sidebarPrimary.style.setProperty('top', headerHeight + socialIconsHeight + menuHeight + 48 + 'px');
    }
    else {
      Object.values(document.querySelectorAll('#sidebar-primary, #menu-primary'))
        .forEach(el => el.style.removeProperty('top'));
    }
  }

  function adjustSidebarHeight(button) {

    var windowWidth = window.innerWidth;

    // if at width when menu is absolutely positioned
    if (  !( windowWidth > 549 && windowWidth < 950 ) ) {
      return;
    }

    // get the submenu
    var list       = button.nextSibling;
    var listHeight = 0;

    // get the height of all the child li elements combined (because ul has max-height: 0)
    Object.values(list.children)
      .forEach(_ => {
      // Using 36 instead of getting height because list items are display: none when closing menu
      listHeight = listHeight + 36;
    });

    let computedStyle = window.getComputedStyle(sidebarPrimary, null);
    console.log(computedStyle);

    // get the current top value for the sidebar
    let sidebarTop = sidebarPrimary.style.getPropertyValue("top");

    let  mainHeight = main.style.getPropertyValue('min-height');

    // remove 'px' so addition is possible
    sidebarTop = parseInt(sidebarTop);

    // remove 'px' so addition is possible
    mainHeight = parseInt(mainHeight);

    // get the li containing the toggle button
    var menuItem = button.parentElement;

    // dropdown is being opened (increase sidebar top value)
    if( menuItem.classList.contains('open') ) {
      sidebarPrimary.style.setProperty('top', sidebarTop + listHeight + 'px');
      main.style.setProperty('min-height', mainHeight + listHeight + 'px');
    }
    // dropdown is being closed (decrease sidebar top value)
    else {
      sidebarPrimary.style.setProperty('top', sidebarTop - listHeight + 'px');
      main.style.setProperty('min-height', mainHeight - listHeight + 'px');
    }
  }

  // if sidebar open and resized over 950px, automatically close it
  function closeMainSidebar() {

    // if no longer at width when menu is absolutely positioned
    if( window.innerWidth > 949 && sidebar.classList.contains('open') ) {
      // run function to close sidebar and all menus
      openPrimaryMenu();
    }
  }

  // increase main height when needed so fixed sidebar can be scrollable
  function setMainMinHeight() {
    // refresh
    main.style.removeProperty('min-height');

    // height is equal to overflow container's height
    var height = overflowContainer.clientHeight;

    // if header image, subtract its height b/c its in
    // .overflow-container, but not in .main
    if ( headerImage !== null ) {
      height = height - headerImage.offsetHeight;
    }
    sidebarHeight = sidebar.offsetHeight;

    if ( sidebarHeight > height ) {
      height = sidebarHeight;
    }

    // add the new minimum height
    if ( height > window.innerHeight ) {
      main.style.setProperty('min-height', height + 'px')
    }
  }

  // Sidebar scrolling.
  function resize() {
    windowWidth   = window.innerWidth;
    windowHeight  = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
    bodyHeight    = overflowContainer.clientHeight;
    sidebarHeight = sidebar.offsetHeight;

    if ( window.innerWidth < 950 ) {
      top = bottom = false;
      sidebar.removeAttribute("style");;
    }
  }

  function scroll() {
    if ( 950 > windowWidth ) {
      return;
    }

    const windowPos = scrollTop();

    // if the sidebar height is not greater than the window height
    if ( ( ( sidebarHeight <= windowHeight ) || short === true ) ) {
      top = true;
      short = true;
      sidebar.style.setProperty('position', 'fixed' );
      return;
    }

    // if the sidebar height + admin bar is greater than the window height
    // if the window has been scrolled down
    if ( windowPos > lastWindowPos ) {
      if ( top ) {
        top = false;
        topOffset = ( sidebar.offsetTop > 0 ) ? sidebar.offsetTop : 0;
        sidebar.style.setProperty('top', topOffset + 'px');
      } else if ( !bottom && windowPos + windowHeight >= sidebarHeight + sidebar.offsetTop && sidebarHeight <= bodyHeight ) {
        bottom = true;
        sidebar.style.setProperty('position', 'fixed');
        sidebar.style.setProperty('bottom', '0');
      }
      // if sidebar was shorter then menu dropdown made it taller
      else if ( ( sidebarHeight  > windowHeight ) && !bottom ) {
        topOffset = ( sidebar.offsetTop > 0 ) ? sidebar.offsetTop : 0;
        sidebar.style.setProperty('top', topOffset + 'px');
      }
    }
    // if the window has been scrolled up
    else if ( windowPos < lastWindowPos ) {
      if ( bottom ) {
        bottom = false;
        topOffset = ( sidebar.offsetTop > 0 ) ? sidebar.offsetTop : 0;
        sidebar.style.setProperty('top', topOffset + 'px');
      } else if ( !top && windowPos >= 0 && windowPos <= sidebar.offsetTop ) {
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

        if (image.classList.contains("no-object-fit")) return;

        image.classList.add("no-object-fit");

        // if the image is not wide enough to fill the space
        if (image.offsetWidth < el.offsetWidth) {
          image.style.setProperty('width', '100%')
          image.style.setProperty('min-width', '100%');
          image.style.setProperty('max-width', '100%');
          image.style.setProperty('height', 'auto');
          image.style.setProperty('min-height', '100%');
          image.style.setProperty('max-height', 'none');
        }

        // if the image is not tall enough to fill the space
        if (image.offsetHeight() < el.offsetHeight) {
          image.style.setProperty('height', '100%')
          image.style.setProperty('min-height', '100%');
          image.style.setProperty('max-height', '100%');
          image.style.setProperty('width', 'auto');
          image.style.setProperty('min-width', '100%');
          image.style.setProperty('max-width', 'none');
        }

        // end foreach
      });

  }
}

function scrollTop() {
  var supportPageOffset = window.scrollY !== undefined;
  var isCSS1Compat = ((document.compatMode || "") === "CSS1Compat");

  var scrollTop = supportPageOffset ? window.scrollY : isCSS1Compat ? document.documentElement.scrollTop : document.body.scrollTop;

  return scrollTop;
}
