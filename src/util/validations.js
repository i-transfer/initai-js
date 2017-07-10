// @flow

import { isEmpty, isString } from 'lodash'

const isValidString = (target: any): boolean =>
  !isEmpty(target) && isString(target)

export { isValidString }
