Component({
  properties: {
    title: String,
    name: String,
    type: {
      type: String,
      value: 'input'
    },
    name: String,
    value: String,
    disabled: Boolean,
    inputType: {
      type: String,
      value: 'text'
    },
    placeholder: String,
    focus: Boolean,
    mode: {
      type: String,
      value: 'normal'
    },
    picker_mode: {
      type: String,
      value: 'selector'
    },
    picker_ranges: Array,
    picker_range_key: String,
    picker_range_value: Number,
    show_value: String,
    right: Boolean,
    error: Boolean,
    maxlength: Number,
    componentId: String
  },

  methods: {
    handleZanFieldChange(event) {
      console.info('[zan:field:change]', event);
      this.triggerEvent('change', event);
    },
  
    handleZanFieldFocus(event) {
      console.info('[zan:field:focus]', event);
  
      this.triggerEvent('focus', event);
    },
  
    handleZanFieldBlur(event) {
      console.info('[zan:field:blur]', event);
  
      this.triggerEvent('blur', event);
    },

    bindPickerChange(event) {
      console.info('[zan:picker:change]', event);
      this.triggerEvent('change', event);
    },
  }
})
