import { CodeInput } from '@srsholmes/solid-code-input'
import hljs from 'highlight.js/lib/core'
import cssModule from 'highlight.js/lib/languages/css'

import {css, classes} from './Editor.scss'
import { debounce } from '../../../util/debounce.js'
import { Popout } from './Popout.jsx'
import { Window } from './Window.jsx'

interface Props {
  styleElm?: HTMLStyleElement
  popout?: boolean
}

hljs.registerLanguage('css', cssModule)

const {
  ui: {
    injectCss,
    Header,
    HeaderTags,
    Button,
    CheckboxItem
  },
  plugin: { store },
  solid: { createSignal, createEffect },
  flux: {
    dispatcher
  }
} = shelter

const saveCss = debounce((css: string, styleElm: HTMLStyleElement) => {
  store.inlineCss = css

  if (styleElm) {
    styleElm.textContent = css
  }
}, 500)

let injectedCss = false

export default function (props: Props) {
  // eslint-disable-next-line prefer-const
  let ref = null

  if (!injectedCss) {
    injectCss(css)
    injectedCss = true
  }

  const [inlineCss, setInlineCss] = createSignal('')
  const [hotReload, setHotReload] = createSignal(true)

  createEffect(() => {
    setInlineCss(store.inlineCss)
  })

  const setCss = (css: string) => {
    if (ref) {
      // Find the textarea in the ref, and autoscroll down
      const textarea = ref.querySelector('textarea')
      if (textarea && textarea.scrollTop !== textarea.scrollHeight) {
        textarea.scrollTop = textarea.scrollHeight
      }
    }

    setInlineCss(css)
    saveCss(css, props.styleElm)
  }

  return (
    <>
      <Header tag={HeaderTags.H1}>CSS Editor</Header>

      {
        !props.popout && (
          <Button
            class={classes.popout}
            onClick={() => {
              document.body.appendChild(
                Window()
              )

              // This closes settings automagically
              dispatcher.dispatch({
                type: 'LAYER_POP'
              })
            }}
          >
            Pop Out 
            <Popout />
          </Button>
        )
      }

      <div class={classes.controls}>
        <CheckboxItem
          checked={hotReload()}
          onChange={setHotReload}
        >
          Hot Reload
        </CheckboxItem>

        <Button
          onClick={() => {
            // Save inline CSS
            setCss(inlineCss())
          }}
          disabled={hotReload()}
        >
          Save & Apply
        </Button>
      </div>

      <div class={classes.ceditor} ref={ref}>
        <CodeInput
          highlightjs={hljs}
          autoHeight={false}
          resize="none"
          placeholder="Enter any CSS here..."
          onChange={hotReload() ? setCss : setInlineCss}
          value={inlineCss()}
          language={'css'}
        />
      </div>
    </>
  )
}
