import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ChipGroup from '../app/components/ChipGroup.vue'
import SegGroup from '../app/components/SegGroup.vue'
import JsonTreeView from '../app/components/JsonTreeView.vue'
import JsonTreeNode from '../app/components/JsonTreeNode.vue'

describe('ChipGroup', () => {
  it('renders all options', () => {
    const wrapper = mount(ChipGroup, {
      props: {
        modelValue: 'a',
        options: [
          { value: 'a', label: 'Alpha' },
          { value: 'b', label: 'Beta' }
        ]
      }
    })
    const chips = wrapper.findAll('.chip')
    expect(chips).toHaveLength(2)
    expect(chips[0]!.text()).toBe('Alpha')
  })

  it('marks the active chip with data-active', () => {
    const wrapper = mount(ChipGroup, {
      props: {
        modelValue: 'b',
        options: [
          { value: 'a', label: 'Alpha' },
          { value: 'b', label: 'Beta' }
        ]
      }
    })
    const chips = wrapper.findAll('.chip')
    expect(chips[0]!.attributes('data-active')).toBe('false')
    expect(chips[1]!.attributes('data-active')).toBe('true')
  })

  it('emits update:modelValue when a chip is clicked', async () => {
    const wrapper = mount(ChipGroup, {
      props: {
        modelValue: 'a',
        options: [
          { value: 'a', label: 'Alpha' },
          { value: 'b', label: 'Beta' }
        ]
      }
    })
    await wrapper.findAll('.chip')[1]!.trigger('click')
    expect(wrapper.emitted('update:modelValue')).toEqual([['b']])
  })

  it('accepts string-only options', () => {
    const wrapper = mount(ChipGroup, {
      props: {
        modelValue: 'foo',
        options: ['foo', 'bar']
      }
    })
    expect(wrapper.findAll('.chip')[1]!.text()).toBe('bar')
  })
})

describe('SegGroup', () => {
  it('renders all options as buttons in a btn-group', () => {
    const wrapper = mount(SegGroup, {
      props: {
        modelValue: 'one',
        options: [
          { value: 'one', label: 'One' },
          { value: 'two', label: 'Two' },
          { value: 'three', label: 'Three' }
        ]
      }
    })
    expect(wrapper.find('.btn-group').exists()).toBe(true)
    expect(wrapper.findAll('.btn')).toHaveLength(3)
  })

  it('emits update:modelValue on click', async () => {
    const wrapper = mount(SegGroup, {
      props: {
        modelValue: 'one',
        options: [
          { value: 'one', label: 'One' },
          { value: 'two', label: 'Two' }
        ]
      }
    })
    await wrapper.findAll('.btn')[1]!.trigger('click')
    expect(wrapper.emitted('update:modelValue')).toEqual([['two']])
  })
})

describe('JsonTreeView', () => {
  const treeMount = (value: unknown) =>
    mount(JsonTreeView, { props: { value }, global: { components: { JsonTreeNode } } })

  it('renders empty state for null', () => {
    expect(treeMount(null).find('.empty').exists()).toBe(true)
  })

  it('renders empty state for undefined', () => {
    expect(treeMount(undefined).find('.empty').exists()).toBe(true)
  })

  it('renders a tree wrapper for an object', () => {
    const wrapper = treeMount({ a: 1, b: 'x' })
    expect(wrapper.find('.json-tree').exists()).toBe(true)
    expect(wrapper.find('.empty').exists()).toBe(false)
  })

  it('renders a tree wrapper for an array', () => {
    expect(treeMount([1, 2, 3]).find('.json-tree').exists()).toBe(true)
  })

  it('shows string values rendered with class jt-string', () => {
    expect(treeMount({ name: 'hello' }).find('.jt-string').text()).toBe('"hello"')
  })

  it('shows number values rendered with class jt-number', () => {
    expect(treeMount({ n: 42 }).find('.jt-number').text()).toBe('42')
  })
})
