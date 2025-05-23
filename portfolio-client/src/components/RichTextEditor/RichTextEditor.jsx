import React, { useRef, useEffect } from 'react'
import Quill from 'quill'
import 'quill/dist/quill.snow.css'
import './RichTextEditor.css'

const RichTextEditor = ({ value, onChange }) => {
	const editorRef = useRef(null)
	const quillInstanceRef = useRef(null)

	const fontSizeArr = ['12px', '14px', '16px', '20px', '24px', '32px']

	const Size = Quill.import('attributors/style/size')
	Size.whitelist = fontSizeArr
	Quill.register(Size, true)

	useEffect(() => {
		if (editorRef.current && !quillInstanceRef.current) {
			quillInstanceRef.current = new Quill(editorRef.current, {
				theme: 'snow',
				modules: {
					toolbar: [
						[{ header: [1, 2, false] }],
						[{ size: fontSizeArr }],
						['bold', 'italic', 'underline'],
						[{ color: [] }],
						['link'],
					],
				},
			})
		}

		return () => {
			if (quillInstanceRef.current) {
				document.querySelector('.ql-toolbar').remove()

				quillInstanceRef.current = null
			}
		}
	}, [])

	useEffect(() => {
		if (
			quillInstanceRef.current &&
			value !== quillInstanceRef.current.root.innerHTML
		) {
			quillInstanceRef.current.root.innerHTML = value
		}
	}, [value])

	const handleContentChange = () => {
		if (quillInstanceRef.current) {
			const html = quillInstanceRef.current.root.innerHTML
			onChange(html)
		}
	}

	useEffect(() => {
		if (quillInstanceRef.current) {
			quillInstanceRef.current.on('text-change', handleContentChange)
		}
		return () => {
			if (quillInstanceRef.current) {
				quillInstanceRef.current.off('text-change', handleContentChange)
			}
		}
	}, [])

	return <div ref={editorRef} />
}

export default RichTextEditor
