---
editUrl: false
next: false
prev: false
title: "Select"
---

> **Select**\<`T`\>(`__namedParameters`): `Element`

Defined in: [src/components/controls/Select/Select.tsx:117](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/controls/Select/Select.tsx#L117)

Select component for choosing single values from a dropdown list.

Supports searchable mode, grouped options, keyboard navigation,
clearable state, and multiple visual variants.

## Type Parameters

### T

`T` *extends* `string` = `string`

## Parameters

### \_\_namedParameters

#### about?

`string`

#### accessKey?

`string`

#### aria-activedescendant?

`string`

Identifies the currently active element when DOM focus is on a composite widget, textbox, group, or application.

#### aria-atomic?

`Booleanish`

Indicates whether assistive technologies will present all, or only parts of, the changed region based on the change notifications defined by the aria-relevant attribute.

#### aria-autocomplete?

`"none"` \| `"inline"` \| `"both"` \| `"list"`

Indicates whether inputting text could trigger display of one or more predictions of the user's intended value for an input and specifies how predictions would be
presented if they are made.

#### aria-braillelabel?

`string`

Defines a string value that labels the current element, which is intended to be converted into Braille.

**See**

aria-label.

#### aria-brailleroledescription?

`string`

Defines a human-readable, author-localized abbreviated description for the role of an element, which is intended to be converted into Braille.

**See**

aria-roledescription.

#### aria-busy?

`Booleanish`

#### aria-checked?

`boolean` \| `"mixed"` \| `"false"` \| `"true"`

Indicates the current "checked" state of checkboxes, radio buttons, and other widgets.

**See**

 - aria-pressed
 - aria-selected.

#### aria-colcount?

`number`

Defines the total number of columns in a table, grid, or treegrid.

**See**

aria-colindex.

#### aria-colindex?

`number`

Defines an element's column index or position with respect to the total number of columns within a table, grid, or treegrid.

**See**

 - aria-colcount
 - aria-colspan.

#### aria-colindextext?

`string`

Defines a human readable text alternative of aria-colindex.

**See**

aria-rowindextext.

#### aria-colspan?

`number`

Defines the number of columns spanned by a cell or gridcell within a table, grid, or treegrid.

**See**

 - aria-colindex
 - aria-rowspan.

#### aria-controls?

`string`

Identifies the element (or elements) whose contents or presence are controlled by the current element.

**See**

aria-owns.

#### aria-current?

`boolean` \| `"page"` \| `"false"` \| `"true"` \| `"step"` \| `"location"` \| `"date"` \| `"time"`

Indicates the element that represents the current item within a container or set of related elements.

#### aria-describedby?

`string`

Identifies the element (or elements) that describes the object.

**See**

aria-labelledby

#### aria-description?

`string`

Defines a string value that describes or annotates the current element.

**See**

related aria-describedby.

#### aria-details?

`string`

Identifies the element that provides a detailed, extended description for the object.

**See**

aria-describedby.

#### aria-disabled?

`Booleanish`

Indicates that the element is perceivable but disabled, so it is not editable or otherwise operable.

**See**

 - aria-hidden
 - aria-readonly.

#### aria-dropeffect?

`"link"` \| `"none"` \| `"copy"` \| `"move"` \| `"execute"` \| `"popup"`

Indicates what functions can be performed when a dragged object is released on the drop target.

:::caution[Deprecated]
in ARIA 1.1
:::

#### aria-errormessage?

`string`

Identifies the element that provides an error message for the object.

**See**

 - aria-invalid
 - aria-describedby.

#### aria-expanded?

`Booleanish`

Indicates whether the element, or another grouping element it controls, is currently expanded or collapsed.

#### aria-flowto?

`string`

Identifies the next element (or elements) in an alternate reading order of content which, at the user's discretion,
allows assistive technology to override the general default of reading in document source order.

#### aria-grabbed?

`Booleanish`

Indicates an element's "grabbed" state in a drag-and-drop operation.

:::caution[Deprecated]
in ARIA 1.1
:::

#### aria-haspopup?

`boolean` \| `"grid"` \| `"listbox"` \| `"menu"` \| `"false"` \| `"true"` \| `"dialog"` \| `"tree"`

Indicates the availability and type of interactive popup element, such as menu or dialog, that can be triggered by an element.

#### aria-hidden?

`Booleanish`

Indicates whether the element is exposed to an accessibility API.

**See**

aria-disabled.

#### aria-invalid?

`boolean` \| `"false"` \| `"true"` \| `"grammar"` \| `"spelling"`

Indicates the entered value does not conform to the format expected by the application.

**See**

aria-errormessage.

#### aria-keyshortcuts?

`string`

Indicates keyboard shortcuts that an author has implemented to activate or give focus to an element.

#### aria-label?

`string`

Defines a string value that labels the current element.

**See**

aria-labelledby.

#### aria-labelledby?

`string`

Identifies the element (or elements) that labels the current element.

**See**

aria-describedby.

#### aria-level?

`number`

Defines the hierarchical level of an element within a structure.

#### aria-live?

`"off"` \| `"assertive"` \| `"polite"`

Indicates that an element will be updated, and describes the types of updates the user agents, assistive technologies, and user can expect from the live region.

#### aria-modal?

`Booleanish`

Indicates whether an element is modal when displayed.

#### aria-multiline?

`Booleanish`

Indicates whether a text box accepts multiple lines of input or only a single line.

#### aria-multiselectable?

`Booleanish`

Indicates that the user may select more than one item from the current selectable descendants.

#### aria-orientation?

`"horizontal"` \| `"vertical"`

Indicates whether the element's orientation is horizontal, vertical, or unknown/ambiguous.

#### aria-owns?

`string`

Identifies an element (or elements) in order to define a visual, functional, or contextual parent/child relationship
between DOM elements where the DOM hierarchy cannot be used to represent the relationship.

**See**

aria-controls.

#### aria-placeholder?

`string`

Defines a short hint (a word or short phrase) intended to aid the user with data entry when the control has no value.
A hint could be a sample value or a brief description of the expected format.

#### aria-posinset?

`number`

Defines an element's number or position in the current set of listitems or treeitems. Not required if all elements in the set are present in the DOM.

**See**

aria-setsize.

#### aria-pressed?

`boolean` \| `"mixed"` \| `"false"` \| `"true"`

Indicates the current "pressed" state of toggle buttons.

**See**

 - aria-checked
 - aria-selected.

#### aria-readonly?

`Booleanish`

Indicates that the element is not editable, but is otherwise operable.

**See**

aria-disabled.

#### aria-relevant?

`"text"` \| `"all"` \| `"additions"` \| `"additions removals"` \| `"additions text"` \| `"removals"` \| `"removals additions"` \| `"removals text"` \| `"text additions"` \| `"text removals"`

Indicates what notifications the user agent will trigger when the accessibility tree within a live region is modified.

**See**

aria-atomic.

#### aria-required?

`Booleanish`

Indicates that user input is required on the element before a form may be submitted.

#### aria-roledescription?

`string`

Defines a human-readable, author-localized description for the role of an element.

#### aria-rowcount?

`number`

Defines the total number of rows in a table, grid, or treegrid.

**See**

aria-rowindex.

#### aria-rowindex?

`number`

Defines an element's row index or position with respect to the total number of rows within a table, grid, or treegrid.

**See**

 - aria-rowcount
 - aria-rowspan.

#### aria-rowindextext?

`string`

Defines a human readable text alternative of aria-rowindex.

**See**

aria-colindextext.

#### aria-rowspan?

`number`

Defines the number of rows spanned by a cell or gridcell within a table, grid, or treegrid.

**See**

 - aria-rowindex
 - aria-colspan.

#### aria-selected?

`Booleanish`

Indicates the current "selected" state of various widgets.

**See**

 - aria-checked
 - aria-pressed.

#### aria-setsize?

`number`

Defines the number of items in the current set of listitems or treeitems. Not required if all elements in the set are present in the DOM.

**See**

aria-posinset.

#### aria-sort?

`"none"` \| `"ascending"` \| `"descending"` \| `"other"`

Indicates if items in a table or grid are sorted in ascending or descending order.

#### aria-valuemax?

`number`

Defines the maximum allowed value for a range widget.

#### aria-valuemin?

`number`

Defines the minimum allowed value for a range widget.

#### aria-valuenow?

`number`

Defines the current value for a range widget.

**See**

aria-valuetext.

#### aria-valuetext?

`string`

Defines the human readable text alternative of aria-valuenow for a range widget.

#### autoCapitalize?

`"none"` \| `string` & `object` \| `"off"` \| `"on"` \| `"sentences"` \| `"words"` \| `"characters"`

#### autoCorrect?

`string`

#### autoFocus?

`boolean`

#### autoSave?

`string`

#### children?

`ReactNode`

#### className?

`string`

Additional CSS class names

#### clearable?

`boolean` = `false`

Whether a clear button appears when value is selected

**Default**

```ts
false
```

#### color?

`string`

#### content?

`string`

#### contentEditable?

`"inherit"` \| `Booleanish` \| `"plaintext-only"`

#### contextMenu?

`string`

#### dangerouslySetInnerHTML?

\{ `__html`: `string` \| `TrustedHTML`; \}

#### dangerouslySetInnerHTML.__html

`string` \| `TrustedHTML`

#### datatype?

`string`

#### defaultChecked?

`boolean`

#### defaultValue?

`T`

Default selected value (uncontrolled)

#### dir?

`string`

#### disabled?

`boolean` = `false`

Whether the select is disabled

**Default**

```ts
false
```

#### draggable?

`Booleanish`

#### emptyMessage?

`string` = `'No results found'`

Message shown when search yields no results

**Default**

```ts
"No results found"
```

#### enterKeyHint?

`"search"` \| `"next"` \| `"enter"` \| `"done"` \| `"go"` \| `"previous"` \| `"send"`

#### error?

`boolean` = `false`

Error state

**Default**

```ts
false
```

#### errorMessage?

`string`

Error message

#### exportparts?

`string`

**See**

[https://developer.mozilla.org/en-US/docs/Web/HTML/Global\_attributes/exportparts](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/exportparts)

#### filterFn?

(`option`, `query`) => `boolean`

Custom filter function for searchable mode

#### helperText?

`string`

Helper text displayed below the select

#### hidden?

`boolean`

#### id?

`string`

Unique identifier for the component

#### inert?

`boolean`

**See**

[https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/inert](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/inert)

#### inlist?

`any`

#### inputMode?

`"search"` \| `"text"` \| `"none"` \| `"tel"` \| `"url"` \| `"email"` \| `"numeric"` \| `"decimal"`

Hints at the type of data that might be entered by the user while editing the element or its contents

**See**

[https://html.spec.whatwg.org/multipage/interaction.html#input-modalities:-the-inputmode-attribute](https://html.spec.whatwg.org/multipage/interaction.html#input-modalities:-the-inputmode-attribute)

#### is?

`string`

Specify that a standard HTML element should behave like a defined custom built-in element

**See**

[https://html.spec.whatwg.org/multipage/custom-elements.html#attr-is](https://html.spec.whatwg.org/multipage/custom-elements.html#attr-is)

#### itemID?

`string`

#### itemProp?

`string`

#### itemRef?

`string`

#### itemScope?

`boolean`

#### itemType?

`string`

#### label?

`string`

Label displayed above the select

#### lang?

`string`

#### maxDropdownHeight?

`number` = `240`

Maximum height of the dropdown in pixels

**Default**

```ts
240
```

#### minDropdownWidth?

`number`

Minimum width of the dropdown in pixels.
When set, the dropdown will be at least this wide,
even if the trigger is narrower.

#### name?

`string`

Name attribute for form submission

#### nonce?

`string`

#### onAbort?

`ReactEventHandler`\<`HTMLButtonElement`\>

#### onAbortCapture?

`ReactEventHandler`\<`HTMLButtonElement`\>

#### onAnimationEnd?

`AnimationEventHandler`\<`HTMLButtonElement`\>

#### onAnimationEndCapture?

`AnimationEventHandler`\<`HTMLButtonElement`\>

#### onAnimationIteration?

`AnimationEventHandler`\<`HTMLButtonElement`\>

#### onAnimationIterationCapture?

`AnimationEventHandler`\<`HTMLButtonElement`\>

#### onAnimationStart?

`AnimationEventHandler`\<`HTMLButtonElement`\>

#### onAnimationStartCapture?

`AnimationEventHandler`\<`HTMLButtonElement`\>

#### onAuxClick?

`MouseEventHandler`\<`HTMLButtonElement`\>

#### onAuxClickCapture?

`MouseEventHandler`\<`HTMLButtonElement`\>

#### onBeforeInput?

`InputEventHandler`\<`HTMLButtonElement`\>

#### onBeforeInputCapture?

`InputEventHandler`\<`HTMLButtonElement`\>

#### onBeforeToggle?

`ToggleEventHandler`\<`HTMLButtonElement`\>

#### onBlur?

`FocusEventHandler`\<`HTMLButtonElement`\>

#### onBlurCapture?

`FocusEventHandler`\<`HTMLButtonElement`\>

#### onCanPlay?

`ReactEventHandler`\<`HTMLButtonElement`\>

#### onCanPlayCapture?

`ReactEventHandler`\<`HTMLButtonElement`\>

#### onCanPlayThrough?

`ReactEventHandler`\<`HTMLButtonElement`\>

#### onCanPlayThroughCapture?

`ReactEventHandler`\<`HTMLButtonElement`\>

#### onChange?

(`value`) => `void`

Change event handler

#### onChangeCapture?

`ChangeEventHandler`\<`HTMLButtonElement`, `Element`\>

#### onClick?

`MouseEventHandler`\<`HTMLButtonElement`\>

#### onClickCapture?

`MouseEventHandler`\<`HTMLButtonElement`\>

#### onCompositionEnd?

`CompositionEventHandler`\<`HTMLButtonElement`\>

#### onCompositionEndCapture?

`CompositionEventHandler`\<`HTMLButtonElement`\>

#### onCompositionStart?

`CompositionEventHandler`\<`HTMLButtonElement`\>

#### onCompositionStartCapture?

`CompositionEventHandler`\<`HTMLButtonElement`\>

#### onCompositionUpdate?

`CompositionEventHandler`\<`HTMLButtonElement`\>

#### onCompositionUpdateCapture?

`CompositionEventHandler`\<`HTMLButtonElement`\>

#### onContextMenu?

`MouseEventHandler`\<`HTMLButtonElement`\>

#### onContextMenuCapture?

`MouseEventHandler`\<`HTMLButtonElement`\>

#### onCopy?

`ClipboardEventHandler`\<`HTMLButtonElement`\>

#### onCopyCapture?

`ClipboardEventHandler`\<`HTMLButtonElement`\>

#### onCut?

`ClipboardEventHandler`\<`HTMLButtonElement`\>

#### onCutCapture?

`ClipboardEventHandler`\<`HTMLButtonElement`\>

#### onDoubleClick?

`MouseEventHandler`\<`HTMLButtonElement`\>

#### onDoubleClickCapture?

`MouseEventHandler`\<`HTMLButtonElement`\>

#### onDrag?

`DragEventHandler`\<`HTMLButtonElement`\>

#### onDragCapture?

`DragEventHandler`\<`HTMLButtonElement`\>

#### onDragEnd?

`DragEventHandler`\<`HTMLButtonElement`\>

#### onDragEndCapture?

`DragEventHandler`\<`HTMLButtonElement`\>

#### onDragEnter?

`DragEventHandler`\<`HTMLButtonElement`\>

#### onDragEnterCapture?

`DragEventHandler`\<`HTMLButtonElement`\>

#### onDragExit?

`DragEventHandler`\<`HTMLButtonElement`\>

#### onDragExitCapture?

`DragEventHandler`\<`HTMLButtonElement`\>

#### onDragLeave?

`DragEventHandler`\<`HTMLButtonElement`\>

#### onDragLeaveCapture?

`DragEventHandler`\<`HTMLButtonElement`\>

#### onDragOver?

`DragEventHandler`\<`HTMLButtonElement`\>

#### onDragOverCapture?

`DragEventHandler`\<`HTMLButtonElement`\>

#### onDragStart?

`DragEventHandler`\<`HTMLButtonElement`\>

#### onDragStartCapture?

`DragEventHandler`\<`HTMLButtonElement`\>

#### onDrop?

`DragEventHandler`\<`HTMLButtonElement`\>

#### onDropCapture?

`DragEventHandler`\<`HTMLButtonElement`\>

#### onDurationChange?

`ReactEventHandler`\<`HTMLButtonElement`\>

#### onDurationChangeCapture?

`ReactEventHandler`\<`HTMLButtonElement`\>

#### onEmptied?

`ReactEventHandler`\<`HTMLButtonElement`\>

#### onEmptiedCapture?

`ReactEventHandler`\<`HTMLButtonElement`\>

#### onEncrypted?

`ReactEventHandler`\<`HTMLButtonElement`\>

#### onEncryptedCapture?

`ReactEventHandler`\<`HTMLButtonElement`\>

#### onEnded?

`ReactEventHandler`\<`HTMLButtonElement`\>

#### onEndedCapture?

`ReactEventHandler`\<`HTMLButtonElement`\>

#### onError?

`ReactEventHandler`\<`HTMLButtonElement`\>

#### onErrorCapture?

`ReactEventHandler`\<`HTMLButtonElement`\>

#### onFocus?

`FocusEventHandler`\<`HTMLButtonElement`\>

#### onFocusCapture?

`FocusEventHandler`\<`HTMLButtonElement`\>

#### onGotPointerCapture?

`PointerEventHandler`\<`HTMLButtonElement`\>

#### onGotPointerCaptureCapture?

`PointerEventHandler`\<`HTMLButtonElement`\>

#### onInput?

`InputEventHandler`\<`HTMLButtonElement`\>

#### onInputCapture?

`InputEventHandler`\<`HTMLButtonElement`\>

#### onInvalid?

`ReactEventHandler`\<`HTMLButtonElement`\>

#### onInvalidCapture?

`ReactEventHandler`\<`HTMLButtonElement`\>

#### onKeyDown?

`KeyboardEventHandler`\<`HTMLButtonElement`\>

#### onKeyDownCapture?

`KeyboardEventHandler`\<`HTMLButtonElement`\>

#### onKeyPress?

`KeyboardEventHandler`\<`HTMLButtonElement`\>

:::caution[Deprecated]
Use `onKeyUp` or `onKeyDown` instead
:::

#### onKeyPressCapture?

`KeyboardEventHandler`\<`HTMLButtonElement`\>

:::caution[Deprecated]
Use `onKeyUpCapture` or `onKeyDownCapture` instead
:::

#### onKeyUp?

`KeyboardEventHandler`\<`HTMLButtonElement`\>

#### onKeyUpCapture?

`KeyboardEventHandler`\<`HTMLButtonElement`\>

#### onLoad?

`ReactEventHandler`\<`HTMLButtonElement`\>

#### onLoadCapture?

`ReactEventHandler`\<`HTMLButtonElement`\>

#### onLoadedData?

`ReactEventHandler`\<`HTMLButtonElement`\>

#### onLoadedDataCapture?

`ReactEventHandler`\<`HTMLButtonElement`\>

#### onLoadedMetadata?

`ReactEventHandler`\<`HTMLButtonElement`\>

#### onLoadedMetadataCapture?

`ReactEventHandler`\<`HTMLButtonElement`\>

#### onLoadStart?

`ReactEventHandler`\<`HTMLButtonElement`\>

#### onLoadStartCapture?

`ReactEventHandler`\<`HTMLButtonElement`\>

#### onLostPointerCapture?

`PointerEventHandler`\<`HTMLButtonElement`\>

#### onLostPointerCaptureCapture?

`PointerEventHandler`\<`HTMLButtonElement`\>

#### onMouseDown?

`MouseEventHandler`\<`HTMLButtonElement`\>

#### onMouseDownCapture?

`MouseEventHandler`\<`HTMLButtonElement`\>

#### onMouseEnter?

`MouseEventHandler`\<`HTMLButtonElement`\>

#### onMouseLeave?

`MouseEventHandler`\<`HTMLButtonElement`\>

#### onMouseMove?

`MouseEventHandler`\<`HTMLButtonElement`\>

#### onMouseMoveCapture?

`MouseEventHandler`\<`HTMLButtonElement`\>

#### onMouseOut?

`MouseEventHandler`\<`HTMLButtonElement`\>

#### onMouseOutCapture?

`MouseEventHandler`\<`HTMLButtonElement`\>

#### onMouseOver?

`MouseEventHandler`\<`HTMLButtonElement`\>

#### onMouseOverCapture?

`MouseEventHandler`\<`HTMLButtonElement`\>

#### onMouseUp?

`MouseEventHandler`\<`HTMLButtonElement`\>

#### onMouseUpCapture?

`MouseEventHandler`\<`HTMLButtonElement`\>

#### onOpenChange?

(`open`) => `void`

Open state change handler

#### onPaste?

`ClipboardEventHandler`\<`HTMLButtonElement`\>

#### onPasteCapture?

`ClipboardEventHandler`\<`HTMLButtonElement`\>

#### onPause?

`ReactEventHandler`\<`HTMLButtonElement`\>

#### onPauseCapture?

`ReactEventHandler`\<`HTMLButtonElement`\>

#### onPlay?

`ReactEventHandler`\<`HTMLButtonElement`\>

#### onPlayCapture?

`ReactEventHandler`\<`HTMLButtonElement`\>

#### onPlaying?

`ReactEventHandler`\<`HTMLButtonElement`\>

#### onPlayingCapture?

`ReactEventHandler`\<`HTMLButtonElement`\>

#### onPointerCancel?

`PointerEventHandler`\<`HTMLButtonElement`\>

#### onPointerCancelCapture?

`PointerEventHandler`\<`HTMLButtonElement`\>

#### onPointerDown?

`PointerEventHandler`\<`HTMLButtonElement`\>

#### onPointerDownCapture?

`PointerEventHandler`\<`HTMLButtonElement`\>

#### onPointerEnter?

`PointerEventHandler`\<`HTMLButtonElement`\>

#### onPointerLeave?

`PointerEventHandler`\<`HTMLButtonElement`\>

#### onPointerMove?

`PointerEventHandler`\<`HTMLButtonElement`\>

#### onPointerMoveCapture?

`PointerEventHandler`\<`HTMLButtonElement`\>

#### onPointerOut?

`PointerEventHandler`\<`HTMLButtonElement`\>

#### onPointerOutCapture?

`PointerEventHandler`\<`HTMLButtonElement`\>

#### onPointerOver?

`PointerEventHandler`\<`HTMLButtonElement`\>

#### onPointerOverCapture?

`PointerEventHandler`\<`HTMLButtonElement`\>

#### onPointerUp?

`PointerEventHandler`\<`HTMLButtonElement`\>

#### onPointerUpCapture?

`PointerEventHandler`\<`HTMLButtonElement`\>

#### onProgress?

`ReactEventHandler`\<`HTMLButtonElement`\>

#### onProgressCapture?

`ReactEventHandler`\<`HTMLButtonElement`\>

#### onRateChange?

`ReactEventHandler`\<`HTMLButtonElement`\>

#### onRateChangeCapture?

`ReactEventHandler`\<`HTMLButtonElement`\>

#### onReset?

`ReactEventHandler`\<`HTMLButtonElement`\>

#### onResetCapture?

`ReactEventHandler`\<`HTMLButtonElement`\>

#### onScroll?

`UIEventHandler`\<`HTMLButtonElement`\>

#### onScrollCapture?

`UIEventHandler`\<`HTMLButtonElement`\>

#### onScrollEnd?

`UIEventHandler`\<`HTMLButtonElement`\>

#### onScrollEndCapture?

`UIEventHandler`\<`HTMLButtonElement`\>

#### onSeeked?

`ReactEventHandler`\<`HTMLButtonElement`\>

#### onSeekedCapture?

`ReactEventHandler`\<`HTMLButtonElement`\>

#### onSeeking?

`ReactEventHandler`\<`HTMLButtonElement`\>

#### onSeekingCapture?

`ReactEventHandler`\<`HTMLButtonElement`\>

#### onSelect?

`ReactEventHandler`\<`HTMLButtonElement`\>

#### onSelectCapture?

`ReactEventHandler`\<`HTMLButtonElement`\>

#### onStalled?

`ReactEventHandler`\<`HTMLButtonElement`\>

#### onStalledCapture?

`ReactEventHandler`\<`HTMLButtonElement`\>

#### onSubmit?

`SubmitEventHandler`\<`HTMLButtonElement`\>

#### onSubmitCapture?

`SubmitEventHandler`\<`HTMLButtonElement`\>

#### onSuspend?

`ReactEventHandler`\<`HTMLButtonElement`\>

#### onSuspendCapture?

`ReactEventHandler`\<`HTMLButtonElement`\>

#### onTimeUpdate?

`ReactEventHandler`\<`HTMLButtonElement`\>

#### onTimeUpdateCapture?

`ReactEventHandler`\<`HTMLButtonElement`\>

#### onToggle?

`ToggleEventHandler`\<`HTMLButtonElement`\>

#### onTouchCancel?

`TouchEventHandler`\<`HTMLButtonElement`\>

#### onTouchCancelCapture?

`TouchEventHandler`\<`HTMLButtonElement`\>

#### onTouchEnd?

`TouchEventHandler`\<`HTMLButtonElement`\>

#### onTouchEndCapture?

`TouchEventHandler`\<`HTMLButtonElement`\>

#### onTouchMove?

`TouchEventHandler`\<`HTMLButtonElement`\>

#### onTouchMoveCapture?

`TouchEventHandler`\<`HTMLButtonElement`\>

#### onTouchStart?

`TouchEventHandler`\<`HTMLButtonElement`\>

#### onTouchStartCapture?

`TouchEventHandler`\<`HTMLButtonElement`\>

#### onTransitionCancel?

`TransitionEventHandler`\<`HTMLButtonElement`\>

#### onTransitionCancelCapture?

`TransitionEventHandler`\<`HTMLButtonElement`\>

#### onTransitionEnd?

`TransitionEventHandler`\<`HTMLButtonElement`\>

#### onTransitionEndCapture?

`TransitionEventHandler`\<`HTMLButtonElement`\>

#### onTransitionRun?

`TransitionEventHandler`\<`HTMLButtonElement`\>

#### onTransitionRunCapture?

`TransitionEventHandler`\<`HTMLButtonElement`\>

#### onTransitionStart?

`TransitionEventHandler`\<`HTMLButtonElement`\>

#### onTransitionStartCapture?

`TransitionEventHandler`\<`HTMLButtonElement`\>

#### onVolumeChange?

`ReactEventHandler`\<`HTMLButtonElement`\>

#### onVolumeChangeCapture?

`ReactEventHandler`\<`HTMLButtonElement`\>

#### onWaiting?

`ReactEventHandler`\<`HTMLButtonElement`\>

#### onWaitingCapture?

`ReactEventHandler`\<`HTMLButtonElement`\>

#### onWheel?

`WheelEventHandler`\<`HTMLButtonElement`\>

#### onWheelCapture?

`WheelEventHandler`\<`HTMLButtonElement`\>

#### options

([`SelectOptionItem`](/api/interfaces/selectoptionitem/)\<`T`\> \| [`SelectOptionGroup`](/api/interfaces/selectoptiongroup/)\<`T`\>)[]

Options to display — flat list or grouped

#### part?

`string`

**See**

[https://developer.mozilla.org/en-US/docs/Web/HTML/Global\_attributes/part](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/part)

#### placeholder?

`string` = `'Select...'`

Placeholder text when no value is selected

**Default**

```ts
"Select..."
```

#### popover?

`""` \| `"auto"` \| `"manual"` \| `"hint"`

#### popoverTarget?

`string`

#### popoverTargetAction?

`"hide"` \| `"show"` \| `"toggle"`

#### prefix?

`string`

#### property?

`string`

#### radioGroup?

`string`

#### ref?

`Ref`\<`HTMLButtonElement`\>

#### rel?

`string`

#### required?

`boolean` = `false`

Whether the select is required

**Default**

```ts
false
```

#### resource?

`string`

#### results?

`number`

#### rev?

`string`

#### role?

`AriaRole`

#### searchable?

`boolean` = `false`

Whether to show a search/filter input inside the dropdown

**Default**

```ts
false
```

#### searchPlaceholder?

`string` = `'Search...'`

Placeholder for the search input

**Default**

```ts
"Search..."
```

#### security?

`string`

#### size?

[`Size`](/api/type-aliases/size/) = `'md'`

Size using standard library sizing
- `sm`: 20px trigger height
- `md`: 24px trigger height
- `lg`: 32px trigger height

**Default**

```ts
"md"
```

#### slot?

`string`

#### spellCheck?

`Booleanish`

#### style?

`CSSProperties`

Custom inline styles

#### suppressContentEditableWarning?

`boolean`

#### suppressHydrationWarning?

`boolean`

#### tabIndex?

`number`

#### testId?

`string`

Test identifier for automated testing

#### title?

`string`

#### translate?

`"yes"` \| `"no"`

#### typeof?

`string`

#### unselectable?

`"off"` \| `"on"`

#### value?

`T` \| `null`

Selected value (controlled)

#### variant?

[`SelectVariant`](/api/type-aliases/selectvariant/) = `'default'`

Visual variant for the trigger button

**Default**

```ts
"default"
```

#### vocab?

`string`

## Returns

`Element`

## Example

```tsx
<Select
  label="Blend Mode"
  options={[
    { value: 'normal', label: 'Normal' },
    { value: 'multiply', label: 'Multiply' },
    { value: 'screen', label: 'Screen' },
  ]}
  value={blendMode}
  onChange={setBlendMode}
/>
```
