import DefaultTheme from 'vitepress/theme'
import './custom.css'

const DEFAULT_WIDE_DIAGRAM_WIDTH = 1600
const WIDE_DIAGRAM_ASPECT_RATIO = 4

function getViewBoxSize(svg) {
  const viewBox = svg?.getAttribute('viewBox')
  if (!viewBox) return null

  const [, , width, height] = viewBox.split(/\s+/).map(Number)
  return width && height ? { width, height } : null
}

function getActualWidth(svg) {
  const size = getViewBoxSize(svg)
  if (!size) return null

  return Math.min(size.width, DEFAULT_WIDE_DIAGRAM_WIDTH)
}

function setMermaidMode(container, mode) {
  const svg = container.querySelector('svg[viewBox]')
  if (!svg) return

  const actualWidth = getActualWidth(svg)
  if (!actualWidth) return

  container.dataset.mermaidMode = mode
  svg.style.maxWidth = 'none'

  if (mode === 'fit') {
    svg.style.width = '100%'
  } else {
    svg.style.width = `${actualWidth}px`
  }

  container
    .closest('.mermaid-viewer')
    ?.querySelectorAll('[data-mermaid-mode]')
    .forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.mermaidMode === mode))
    })
}

function enableMermaidDrag(container) {
  if (container.dataset.mermaidDragEnabled === 'true') return

  let isDragging = false
  let startX = 0
  let startY = 0
  let startScrollLeft = 0
  let startScrollTop = 0

  container.addEventListener('pointerdown', (event) => {
    if (container.dataset.mermaidMode !== 'actual') return
    if (event.button !== 0) return

    const canScroll =
      container.scrollWidth > container.clientWidth ||
      container.scrollHeight > container.clientHeight

    if (!canScroll) return

    isDragging = true
    startX = event.clientX
    startY = event.clientY
    startScrollLeft = container.scrollLeft
    startScrollTop = container.scrollTop
    container.classList.add('is-dragging')
    container.setPointerCapture(event.pointerId)
  })

  container.addEventListener('pointermove', (event) => {
    if (!isDragging) return

    event.preventDefault()
    container.scrollLeft = startScrollLeft - (event.clientX - startX)
    container.scrollTop = startScrollTop - (event.clientY - startY)
  })

  function stopDragging(event) {
    if (!isDragging) return

    isDragging = false
    container.classList.remove('is-dragging')

    if (container.hasPointerCapture(event.pointerId)) {
      container.releasePointerCapture(event.pointerId)
    }
  }

  container.addEventListener('pointerup', stopDragging)
  container.addEventListener('pointercancel', stopDragging)
  container.dataset.mermaidDragEnabled = 'true'
}

function createButton(label, title, onClick) {
  const button = document.createElement('button')
  button.type = 'button'
  button.className = 'mermaid-viewer__button'
  button.textContent = label
  button.title = title
  button.setAttribute('aria-label', title)
  button.addEventListener('click', onClick)
  return button
}

function openFullscreen(source) {
  const dialog = document.createElement('dialog')
  dialog.className = 'mermaid-dialog'

  const chrome = document.createElement('div')
  chrome.className = 'mermaid-dialog__chrome'

  const content = document.createElement('div')
  content.className = 'mermaid mermaid-dialog__content'
  content.innerHTML = source.innerHTML

  const fitButton = createButton('Fit', 'Scale diagram to the fullscreen viewport', () => {
    setMermaidMode(content, 'fit')
  })
  fitButton.dataset.mermaidMode = 'fit'

  const actualButton = createButton('100%', 'Show diagram at 100% size', () => {
    setMermaidMode(content, 'actual')
  })
  actualButton.dataset.mermaidMode = 'actual'

  const closeButton = createButton('Close', 'Close fullscreen diagram', () => {
    dialog.close()
  })

  chrome.append(fitButton, actualButton, closeButton)
  dialog.append(chrome, content)
  document.body.append(dialog)

  dialog.addEventListener('close', () => dialog.remove())
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close()
  })
  dialog.showModal()
  enableMermaidDrag(content)
  setMermaidMode(content, source.dataset.mermaidMode || 'fit')
}

function enhanceMermaidDiagram(container) {
  if (container.dataset.mermaidEnhanced === 'true') return

  const svg = container.querySelector('svg[viewBox]')
  const size = getViewBoxSize(svg)
  if (!svg || !size) return

  const viewer = document.createElement('div')
  viewer.className = 'mermaid-viewer'
  container.before(viewer)
  viewer.append(container)

  const toolbar = document.createElement('div')
  toolbar.className = 'mermaid-viewer__toolbar'

  const fitButton = createButton('Fit', 'Scale diagram to the available width', () => {
    setMermaidMode(container, 'fit')
  })
  fitButton.dataset.mermaidMode = 'fit'

  const actualButton = createButton('100%', 'Show diagram at 100% size', () => {
    setMermaidMode(container, 'actual')
  })
  actualButton.dataset.mermaidMode = 'actual'

  const fullscreenButton = createButton('Fullscreen', 'Open diagram in a fullscreen dialog', () => {
    openFullscreen(container)
  })

  toolbar.append(fitButton, actualButton, fullscreenButton)
  viewer.prepend(toolbar)

  container.dataset.mermaidEnhanced = 'true'
  enableMermaidDrag(container)

  const defaultMode = size.width / size.height >= WIDE_DIAGRAM_ASPECT_RATIO ? 'actual' : 'fit'
  setMermaidMode(container, defaultMode)
}

function enhanceMermaidDiagrams() {
  document.querySelectorAll('.mermaid:not(.mermaid-dialog__content)').forEach(enhanceMermaidDiagram)
}

function watchMermaidDiagrams() {
  if (typeof window === 'undefined') return

  window.requestAnimationFrame(enhanceMermaidDiagrams)

  const observer = new MutationObserver(enhanceMermaidDiagrams)
  observer.observe(document.body, {
    childList: true,
    subtree: true
  })
}

export default {
  ...DefaultTheme,
  enhanceApp(ctx) {
    DefaultTheme.enhanceApp?.(ctx)
    watchMermaidDiagrams()
  }
}
