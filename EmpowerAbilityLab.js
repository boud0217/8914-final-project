//Template Function that can be used to run JavaScript on the page
//Note: This can be changed to whatever JavaScript formatting you would like

'use strict';

var defaultService = "home"


class TabsManual {
  constructor(groupNode) {
    console.log(111)
    this.tablistNode = groupNode;

    this.tabs = [];

    this.firstTab = null;
    this.lastTab = null;

    this.tabs = Array.from(this.tablistNode.querySelectorAll('[role=tab]'));
    this.tabpanels = [];

    var selectedObj = null
    var service = location.hash.replace('#', '').trim();

    for (var i = 0; i < this.tabs.length; i += 1) {
      var tab = this.tabs[i];
      var tabpanel = document.getElementById(tab.getAttribute('aria-controls'));

      tab.tabIndex = -1;
      tab.setAttribute('aria-selected', 'false');
      this.tabpanels.push(tabpanel);

      tab.addEventListener('keydown', this.onKeydown.bind(this));
      tab.addEventListener('click', this.onClick.bind(this));

      if (!this.firstTab) {
        this.firstTab = tab;
      }
      this.lastTab = tab;
      if (service === tab.getAttribute("id")){
        selectedObj = tab
      }
      
    }
    if (selectedObj == null) {
      selectedObj = this.firstTab
    }

    this.setSelectedTab(selectedObj);

    window.addEventListener('hashchange', () => {
      var service = location.hash.replace('#', '');
      console.log("hashchange, service = ",service)
      if (service) {
        for (var i = 0; i < this.tabs.length; i += 1) {
          var tab = this.tabs[i]
          if (service === tab.getAttribute("id")){
            this.setSelectedTab(tab)
          }
        }
      }
    });
  }

  

  setSelectedTab(currentTab) {
    for (var i = 0; i < this.tabs.length; i += 1) {
        var tab = this.tabs[i];
        var panel = this.tabpanels[i];

        if (currentTab === tab) {
            //Update tab attributes
            tab.setAttribute('aria-selected', 'true');
            tab.removeAttribute('tabindex');

            //Show panel
            panel.classList.remove('is-hidden');
            panel.setAttribute('aria-hidden', 'false');

            //Update document title
            var heading = panel.querySelector("h1");
            if (heading) {
                document.title = heading.textContent;
            }

            //Make panel focusable and move focus
            if (!panel.hasAttribute('tabindex')) {
                panel.setAttribute('tabindex', '0');
            }
            panel.focus();
        } else {
            //Deselect other tabs
            tab.setAttribute('aria-selected', 'false');
            tab.tabIndex = -1;

            //Hide other panels
            panel.classList.add('is-hidden');
            panel.setAttribute('aria-hidden', 'true');
        }
    }
}

  moveFocusToTab(currentTab) {
    currentTab.focus();
  }

  moveFocusToPreviousTab(currentTab) {
    var index;

    if (currentTab === this.firstTab) {
      this.moveFocusToTab(this.lastTab);
    } else {
      index = this.tabs.indexOf(currentTab);
      this.moveFocusToTab(this.tabs[index - 1]);
    }
  }

  moveFocusToNextTab(currentTab) {
    var index;

    if (currentTab === this.lastTab) {
      this.moveFocusToTab(this.firstTab);
    } else {
      index = this.tabs.indexOf(currentTab);
      this.moveFocusToTab(this.tabs[index + 1]);
    }
  }

  /* EVENT HANDLERS */

  onKeydown(event) {
    var tgt = event.currentTarget,
      flag = false;

    switch (event.key) {
      case 'ArrowLeft':
        this.moveFocusToPreviousTab(tgt);
        flag = true;
        break;

      case 'ArrowRight':
        this.moveFocusToNextTab(tgt);
        flag = true;
        break;

      case 'Home':
        this.moveFocusToTab(this.firstTab);
        flag = true;
        break;

      case 'End':
        this.moveFocusToTab(this.lastTab);
        flag = true;
        break;

      default:
        break;
    }

    if (flag) {
      event.stopPropagation();
      event.preventDefault();
    }
  }

  // Since this example uses buttons for the tabs, the click onr also is activated
  // with the space and enter keys
  onClick(event) {
    location.hash = event.currentTarget.getAttribute("id");
    // this.setSelectedTab(event.currentTarget);
  }
}
var defaultService = "home"
// Initialize tablist

window.addEventListener('load', function () {
  var tablists = document.querySelectorAll('[role=tablist].manual');
  for (var i = 0; i < tablists.length; i++) {
    new TabsManual(tablists[i]);
  }
});


var aria = aria || {};

aria.Utils = aria.Utils || {};

(function () {
  /*
   * When util functions move focus around, set this true so the focus listener
   * can ignore the events.
   */
  aria.Utils.IgnoreUtilFocusChanges = false;

  aria.Utils.dialogOpenClass = 'has-dialog';

  /**
   * @description Set focus on descendant nodes until the first focusable element is
   *       found.
   * @param element
   *          DOM node for which to find the first focusable descendant.
   * @returns {boolean}
   *  true if a focusable element is found and focus is set.
   */
  aria.Utils.focusFirstDescendant = function (element) {
    for (var i = 0; i < element.childNodes.length; i++) {
      var child = element.childNodes[i];
      if (
        aria.Utils.attemptFocus(child) ||
        aria.Utils.focusFirstDescendant(child)
      ) {
        return true;
      }
    }
    return false;
  }; // end focusFirstDescendant

  /**
   * @description Find the last descendant node that is focusable.
   * @param element
   *          DOM node for which to find the last focusable descendant.
   * @returns {boolean}
   *  true if a focusable element is found and focus is set.
   */
  aria.Utils.focusLastDescendant = function (element) {
    for (var i = element.childNodes.length - 1; i >= 0; i--) {
      var child = element.childNodes[i];
      if (
        aria.Utils.attemptFocus(child) ||
        aria.Utils.focusLastDescendant(child)
      ) {
        return true;
      }
    }
    return false;
  }; // end focusLastDescendant

  /**
   * @description Set Attempt to set focus on the current node.
   * @param element
   *          The node to attempt to focus on.
   * @returns {boolean}
   *  true if element is focused.
   */
  aria.Utils.attemptFocus = function (element) {
    if (!aria.Utils.isFocusable(element)) {
      return false;
    }

    aria.Utils.IgnoreUtilFocusChanges = true;
    try {
      element.focus();
    } catch (e) {
      // continue regardless of error
    }
    aria.Utils.IgnoreUtilFocusChanges = false;
    return document.activeElement === element;
  }; // end attemptFocus

  /* Modals can open modals. Keep track of them with this array. */
  aria.OpenDialogList = aria.OpenDialogList || new Array(0);

  /**
   * @returns {object|void} the last opened dialog (the current dialog)
   */
  aria.getCurrentDialog = function () {
    if (aria.OpenDialogList && aria.OpenDialogList.length) {
      return aria.OpenDialogList[aria.OpenDialogList.length - 1];
    }
  };

  aria.closeCurrentDialog = function () {
    var currentDialog = aria.getCurrentDialog();
    if (currentDialog) {
      currentDialog.close();
      return true;
    }

    return false;
  };

  aria.handleEscape = function (event) {
    var key = event.which || event.keyCode;

    if (key === aria.KeyCode.ESC && aria.closeCurrentDialog()) {
      event.stopPropagation();
    }
  };

  document.addEventListener('keyup', aria.handleEscape);

  /**
   * @class
   * @description Dialog object providing modal focus management.
   *
   * Assumptions: The element serving as the dialog container is present in the
   * DOM and hidden. The dialog container has role='dialog'.
   * @param dialogId
   *          The ID of the element serving as the dialog container.
   * @param focusAfterClosed
   *          Either the DOM node or the ID of the DOM node to focus when the
   *          dialog closes.
   * @param focusFirst
   *          Optional parameter containing either the DOM node or the ID of the
   *          DOM node to focus when the dialog opens. If not specified, the
   *          first focusable element in the dialog will receive focus.
   */
  aria.Dialog = function (dialogId, focusAfterClosed, focusFirst) {
    this.dialogNode = document.getElementById(dialogId);
    if (this.dialogNode === null) {
      throw new Error('No element found with id="' + dialogId + '".');
    }

    var validRoles = ['dialog', 'alertdialog'];
    var isDialog = (this.dialogNode.getAttribute('role') || '')
      .trim()
      .split(/\s+/g)
      .some(function (token) {
        return validRoles.some(function (role) {
          return token === role;
        });
      });
    if (!isDialog) {
      throw new Error(
        'Dialog() requires a DOM element with ARIA role of dialog or alertdialog.'
      );
    }

    // Wrap in an individual backdrop element if one doesn't exist
    // Native <dialog> elements use the ::backdrop pseudo-element, which
    // works similarly.
    var backdropClass = 'dialog-backdrop';
    if (this.dialogNode.parentNode.classList.contains(backdropClass)) {
      this.backdropNode = this.dialogNode.parentNode;
    } else {
      this.backdropNode = document.createElement('div');
      this.backdropNode.className = backdropClass;
      this.dialogNode.parentNode.insertBefore(
        this.backdropNode,
        this.dialogNode
      );
      this.backdropNode.appendChild(this.dialogNode);
    }
    this.backdropNode.classList.add('active');

    // Disable scroll on the body element
    document.body.classList.add(aria.Utils.dialogOpenClass);

    if (typeof focusAfterClosed === 'string') {
      this.focusAfterClosed = document.getElementById(focusAfterClosed);
    } else if (typeof focusAfterClosed === 'object') {
      this.focusAfterClosed = focusAfterClosed;
    } else {
      throw new Error(
        'the focusAfterClosed parameter is required for the aria.Dialog constructor.'
      );
    }

    if (typeof focusFirst === 'string') {
      this.focusFirst = document.getElementById(focusFirst);
    } else if (typeof focusFirst === 'object') {
      this.focusFirst = focusFirst;
    } else {
      this.focusFirst = null;
    }

    // Bracket the dialog node with two invisible, focusable nodes.
    // While this dialog is open, we use these to make sure that focus never
    // leaves the document even if dialogNode is the first or last node.
    var preDiv = document.createElement('div');
    this.preNode = this.dialogNode.parentNode.insertBefore(
      preDiv,
      this.dialogNode
    );
    this.preNode.tabIndex = 0;
    var postDiv = document.createElement('div');
    this.postNode = this.dialogNode.parentNode.insertBefore(
      postDiv,
      this.dialogNode.nextSibling
    );
    this.postNode.tabIndex = 0;

    // If this modal is opening on top of one that is already open,
    // get rid of the document focus listener of the open dialog.
    if (aria.OpenDialogList.length > 0) {
      aria.getCurrentDialog().removeListeners();
    }

    this.addListeners();
    aria.OpenDialogList.push(this);
    this.clearDialog();
    this.dialogNode.className = 'default_dialog'; // make visible

    if (this.focusFirst) {
      this.focusFirst.focus();
    } else {
      aria.Utils.focusFirstDescendant(this.dialogNode);
    }

    this.lastFocus = document.activeElement;
  }; // end Dialog constructor

  aria.Dialog.prototype.clearDialog = function () {
    Array.prototype.map.call(
      this.dialogNode.querySelectorAll('input'),
      function (input) {
        input.value = '';
      }
    );
  };

  /**
   * @description
   *  Hides the current top dialog,
   *  removes listeners of the top dialog,
   *  restore listeners of a parent dialog if one was open under the one that just closed,
   *  and sets focus on the element specified for focusAfterClosed.
   */
  aria.Dialog.prototype.close = function () {
    aria.OpenDialogList.pop();
    this.removeListeners();
    aria.Utils.remove(this.preNode);
    aria.Utils.remove(this.postNode);
    this.dialogNode.className = 'hidden';
    this.backdropNode.classList.remove('active');
    this.focusAfterClosed.focus();

    // If a dialog was open underneath this one, restore its listeners.
    if (aria.OpenDialogList.length > 0) {
      aria.getCurrentDialog().addListeners();
    } else {
      document.body.classList.remove(aria.Utils.dialogOpenClass);
    }
  }; // end close

  /**
   * @description
   *  Hides the current dialog and replaces it with another.
   * @param newDialogId
   *  ID of the dialog that will replace the currently open top dialog.
   * @param newFocusAfterClosed
   *  Optional ID or DOM node specifying where to place focus when the new dialog closes.
   *  If not specified, focus will be placed on the element specified by the dialog being replaced.
   * @param newFocusFirst
   *  Optional ID or DOM node specifying where to place focus in the new dialog when it opens.
   *  If not specified, the first focusable element will receive focus.
   */
  aria.Dialog.prototype.replace = function (
    newDialogId,
    newFocusAfterClosed,
    newFocusFirst
  ) {
    aria.OpenDialogList.pop();
    this.removeListeners();
    aria.Utils.remove(this.preNode);
    aria.Utils.remove(this.postNode);
    this.dialogNode.className = 'hidden';
    this.backdropNode.classList.remove('active');

    var focusAfterClosed = newFocusAfterClosed || this.focusAfterClosed;
    new aria.Dialog(newDialogId, focusAfterClosed, newFocusFirst);
  }; // end replace

  aria.Dialog.prototype.addListeners = function () {
    document.addEventListener('focus', this.trapFocus, true);
  }; // end addListeners

  aria.Dialog.prototype.removeListeners = function () {
    document.removeEventListener('focus', this.trapFocus, true);
  }; // end removeListeners

  aria.Dialog.prototype.trapFocus = function (event) {
    if (aria.Utils.IgnoreUtilFocusChanges) {
      return;
    }
    var currentDialog = aria.getCurrentDialog();
    if (currentDialog.dialogNode.contains(event.target)) {
      currentDialog.lastFocus = event.target;
    } else {
      aria.Utils.focusFirstDescendant(currentDialog.dialogNode);
      if (currentDialog.lastFocus == document.activeElement) {
        aria.Utils.focusLastDescendant(currentDialog.dialogNode);
      }
      currentDialog.lastFocus = document.activeElement;
    }
  }; // end trapFocus

  window.openDialog = function (dialogId, focusAfterClosed, focusFirst) {
    new aria.Dialog(dialogId, focusAfterClosed, focusFirst);
  };

  window.closeDialog = function (closeButton) {
    var topDialog = aria.getCurrentDialog();
    if (topDialog.dialogNode.contains(closeButton)) {
      topDialog.close();
    }
  }; // end closeDialog

  window.replaceDialog = function (
    newDialogId,
    newFocusAfterClosed,
    newFocusFirst
  ) {
    var topDialog = aria.getCurrentDialog();
    if (topDialog.dialogNode.contains(document.activeElement)) {
      topDialog.replace(newDialogId, newFocusAfterClosed, newFocusFirst);
    }
  }; // end replaceDialog
})();
'use strict';
/**
 * @namespace aria
 */

var aria = aria || {};

/**
 * @description
 *  Key code constants
 */
aria.KeyCode = {
  BACKSPACE: 8,
  TAB: 9,
  RETURN: 13,
  SHIFT: 16,
  ESC: 27,
  SPACE: 32,
  PAGE_UP: 33,
  PAGE_DOWN: 34,
  END: 35,
  HOME: 36,
  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40,
  DELETE: 46,
};

aria.Utils = aria.Utils || {};

// Polyfill src https://developer.mozilla.org/en-US/docs/Web/API/Element/matches
aria.Utils.matches = function (element, selector) {
  if (!Element.prototype.matches) {
    Element.prototype.matches =
      Element.prototype.matchesSelector ||
      Element.prototype.mozMatchesSelector ||
      Element.prototype.msMatchesSelector ||
      Element.prototype.oMatchesSelector ||
      Element.prototype.webkitMatchesSelector ||
      function (s) {
        var matches = element.parentNode.querySelectorAll(s);
        var i = matches.length;
        while (--i >= 0 && matches.item(i) !== this) {
          // empty
        }
        return i > -1;
      };
  }

  return element.matches(selector);
};

aria.Utils.remove = function (item) {
  if (item.remove && typeof item.remove === 'function') {
    return item.remove();
  }
  if (
    item.parentNode &&
    item.parentNode.removeChild &&
    typeof item.parentNode.removeChild === 'function'
  ) {
    return item.parentNode.removeChild(item);
  }
  return false;
};

aria.Utils.isFocusable = function (element) {
  if (element.tabIndex < 0) {
    return false;
  }

  if (element.disabled) {
    return false;
  }

  switch (element.nodeName) {
    case 'A':
      return !!element.href && element.rel != 'ignore';
    case 'INPUT':
      return element.type != 'hidden';
    case 'BUTTON':
    case 'SELECT':
    case 'TEXTAREA':
      return true;
    default:
      return false;
  }
};

aria.Utils.getAncestorBySelector = function (element, selector) {
  if (!aria.Utils.matches(element, selector + ' ' + element.tagName)) {
    // Element is not inside an element that matches selector
    return null;
  }

  // Move up the DOM tree until a parent matching the selector is found
  var currentNode = element;
  var ancestor = null;
  while (ancestor === null) {
    if (aria.Utils.matches(currentNode.parentNode, selector)) {
      ancestor = currentNode.parentNode;
    } else {
      currentNode = currentNode.parentNode;
    }
  }

  return ancestor;
};

aria.Utils.hasClass = function (element, className) {
  return new RegExp('(\\s|^)' + className + '(\\s|$)').test(element.className);
};

aria.Utils.addClass = function (element, className) {
  if (!aria.Utils.hasClass(element, className)) {
    element.className += ' ' + className;
  }
};

aria.Utils.removeClass = function (element, className) {
  var classRegex = new RegExp('(\\s|^)' + className + '(\\s|$)');
  element.className = element.className.replace(classRegex, ' ').trim();
};

aria.Utils.bindMethods = function (object /* , ...methodNames */) {
  var methodNames = Array.prototype.slice.call(arguments, 1);
  methodNames.forEach(function (method) {
    object[method] = object[method].bind(object);
  });
};


/**
 * @class
 * @description Manages the Schedule a Call form with:
 * - Conditional display of "Please tell us about your event"
 * - Email validation
 * - Success/Error message display via JS alert
 */
class ScheduleForm {
  constructor() {
    this.check2 = document.getElementById('check2');
    this.eventSection = document.getElementById('eventSection');
    this.emailInput = document.getElementById('email');
    this.scheduleButton = document.getElementById('scheduleButton');
    this.emailError = document.getElementById('emailError');
    this.receiveUpdates = document.getElementById('receiveUpdates');
    
    // Add event listeners
    if (this.check2 && this.eventSection) {
      this.check2.addEventListener('change', this.onCheck2Change.bind(this));
    }
    
    if (this.emailInput) {
      this.emailInput.addEventListener('blur', this.validateEmail.bind(this));
      this.emailInput.addEventListener('input', this.clearEmailError.bind(this));
    }
    
    if (this.scheduleButton) {
      this.scheduleButton.addEventListener('click', this.submitForm.bind(this));
    }
    
    if (this.receiveUpdates) {
      this.receiveUpdates.addEventListener('change', this.updateSwitchLabel.bind(this));
      this.updateSwitchLabel();
    }
  }
  
  onCheck2Change(event) {
    // Show/hide the event textarea based on checkbox state
    if (event.target.checked) {
      this.eventSection.hidden = false;
      this.eventSection.setAttribute('aria-hidden', 'false');
    } else {
      this.eventSection.hidden = true;
      this.eventSection.setAttribute('aria-hidden', 'true');
    }
  }
  
  updateSwitchLabel() {
    const label = document.querySelector('.switch-label');
    if (label) {
      label.textContent = this.receiveUpdates.checked ? 'on' : 'off';
    }
  }
  
  validateEmail() {
    const email = this.emailInput.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!email) {
      this.showEmailError('Email is required');
      return false;
    }
    
    if (!emailRegex.test(email)) {
      this.showEmailError('Please enter a valid email address');
      return false;
    }
    
    this.clearEmailError();
    return true;
  }
  
  showEmailError(message) {
    this.emailInput.setAttribute('aria-invalid', 'true');
    this.emailError.textContent = message;
    this.emailError.classList.add('d-block');
    
    // Display error dialog
    document.getElementById('emailErrorMessage').textContent = message;
    openDialog('dialogEmailError', this.scheduleButton);
  }
  
  clearEmailError() {
    this.emailInput.setAttribute('aria-invalid', 'false');
    this.emailError.textContent = '';
    this.emailError.classList.remove('d-block');
  }
  
  submitForm(event) {
    event.preventDefault();
    
    // Validate email
    if (!this.validateEmail()) {
      return;
    }
    
    // Set button to busy state
    this.scheduleButton.setAttribute('aria-busy', 'true');
    this.scheduleButton.disabled = true;
    
    // Simulate form submission (replace with actual API call)
    setTimeout(() => {
      this.scheduleButton.setAttribute('aria-busy', 'false');
      this.scheduleButton.disabled = false;
      
      // Display success dialog
      document.getElementById('successMessage').textContent = 'Thank you! We have received your request. Our team will contact you soon.';
      openDialog('dialogSuccess', this.scheduleButton);
      
      // Clear form fields
      this.clearForm();
    }, 1000);
  }
  
  clearForm() {
    document.getElementById('businessName').value = '';
    document.getElementById('phoneNumber').value = '';
    this.emailInput.value = '';
    document.getElementById('check1').checked = false;
    this.check2.checked = false;
    document.getElementById('check3').checked = false;
    document.getElementById('event').value = '';
    document.getElementById('receiveUpdates').checked = true;
    this.updateSwitchLabel();
    
    // Hide event section if it was shown
    if (this.eventSection && !this.eventSection.hidden) {
      this.eventSection.hidden = true;
      this.eventSection.setAttribute('aria-hidden', 'true');
      this.check2.checked = false;
    }
  }
}

// Initialize the form when the page loads
window.addEventListener('load', function () {
  // Existing code...
  
  // Initialize Schedule Form
  new ScheduleForm();
});
