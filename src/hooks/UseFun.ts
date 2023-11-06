import { shallow } from 'zustand/shallow'

import { createUseFunStore } from '../store'

export const useFun = createUseFunStore()

export const ShallowEqual = shallow
