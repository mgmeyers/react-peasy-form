import * as React from 'react'
import * as prop from 'prop-ops'

import FormFields from 'data/FormFields'

import { AddFieldOpts, FormProps, ValidateOnOpts, TransformFn } from 'types'

interface FormState {
  fields: FormFields
}

export const FormContext = React.createContext<FormState>({
  fields: new FormFields({}),
})

class Form extends React.Component<FormProps, FormState> {
  constructor(props: FormProps) {
    super(props)

    this.state = {
      fields: new FormFields({
        defaults: this.props.defaults,
        validateOn: this.props.validateOn,
        validationStrategy: this.props.validationStrategy,
      }),
    }
  }

  componentDidUpdate(prevProps: FormProps) {
    const { validateOn, defaults, validationStrategy } = this.props
    let fields = this.state.fields

    if (prevProps.validateOn !== validateOn) {
      fields = fields.setDefaultValidateOn(validateOn)
    }

    if (prevProps.defaults !== defaults) {
      fields = fields.setDefaults(defaults)
    }

    if (prevProps.validationStrategy !== validationStrategy) {
      fields = fields.setValidationStrategy(validationStrategy)
    }

    if (fields !== this.state.fields) {
      this.setState(state => prop.set(state, 'fields', fields))
    }
  }

  handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const { onError, onSubmit, preValidate } = this.props
    const { fields } = this.state

    if (preValidate) {
      preValidate()
    }

    const results = fields.validate()

    this.updateFields(() => results.fields)

    if (results.valid) {
      onSubmit(fields.values)
    } else if (onError) {
      onError(results.fields.errors)
    }
  }

  add = (field: AddFieldOpts) => {
    this.updateFields(fields => fields.add(field))
  }

  remove = (key: string) => {
    this.updateFields(fields => fields.remove(key))
  }

  validateField = (key: string) => {
    this.updateFields(fields => fields.validateField(key).fields)
  }

  setValue = (key: string, value: string) => {
    this.updateFields(fields => fields.setValue(key, value))
  }

  setValidation = (key: string, validate: any) => {
    this.updateFields(fields => fields.setValidation(key, validate))
  }

  setValidateOn = (key: string, validateOn: ValidateOnOpts) => {
    this.updateFields(fields => fields.setValidateOn(key, validateOn))
  }

  setTransform = (key: string, transform: TransformFn) => {
    this.updateFields(fields => fields.setTransform(key, transform))
  }

  updateFields(fn: (s: FormFields) => FormFields) {
    this.setState(state => prop.set(state, 'fields', fn(state.fields)))
  }

  render() {
    return (
      <FormContext.Provider value={this.state}>
        <form onSubmit={this.handleSubmit}>{this.props.children}</form>
      </FormContext.Provider>
    )
  }
}

export default Form
