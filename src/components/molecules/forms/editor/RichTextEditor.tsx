'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { TableCellNode, TableNode, TableRowNode } from '@lexical/table';
import { ListItemNode, ListNode } from '@lexical/list';
import { CodeHighlightNode, CodeNode } from '@lexical/code';
import { $isLinkNode, AutoLinkNode, LinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { TRANSFORMERS } from '@lexical/markdown';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { cn } from '@/lib/utils';
import FormErrorMessage from '../FormErrorMessage';
import ImagesPlugin, { InsertImageDialog } from './ImagesPlugin'; // Optional: If you want to use the dialog directly
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { RefObject } from 'react';
import {
    $getSelection,
    $isRangeSelection,
    FORMAT_TEXT_COMMAND,
    FORMAT_ELEMENT_COMMAND,
    UNDO_COMMAND,
    REDO_COMMAND,
    $createParagraphNode,
    $getRoot,
    TextFormatType,
    EditorState,
} from 'lexical';
import {
    INSERT_ORDERED_LIST_COMMAND,
    INSERT_UNORDERED_LIST_COMMAND,
    REMOVE_LIST_COMMAND,
} from '@lexical/list';
import { $getSelectionStyleValueForProperty, $patchStyleText, $setBlocksType } from '@lexical/selection';
import { $createHeadingNode, $createQuoteNode } from '@lexical/rich-text';
import {
    MdFormatBold,
    MdFormatItalic,
    MdFormatUnderlined,
    MdStrikethroughS,
    MdCode,
    MdFormatListBulleted,
    MdFormatListNumbered,
    MdFormatQuote,
    MdUndo,
    MdRedo,
    MdFormatAlignLeft,
    MdFormatAlignCenter,
    MdFormatAlignRight,
    MdFormatAlignJustify,
    MdImage,
    MdLink,
    MdClose,
    MdFormatColorText,
    MdFormatColorFill,
    MdLinkOff,
} from 'react-icons/md';
import { ImageNode } from './ImageNode';
import { useDebounce } from '@/hooks/useDebounce';
import SelectInput from '../SelectInput';
import Sketch from '@uiw/react-color-sketch';
import ColorPickerDialog from '../ColorPickerDialog';
import { useTranslations } from 'use-intl';
import { useOutsideClick } from '@/hooks/useOutsideClick';

const BLOCK_TYPE_OPTIONS = [
    { label: 'Normal', value: 'paragraph' },
    { label: 'Heading 1', value: 'h1' },
    { label: 'Heading 2', value: 'h2' },
    { label: 'Heading 3', value: 'h3' },
    { label: 'Quote', value: 'quote' },
];

const FONT_SIZE_OPTIONS = [
    { label: '10px', value: '10px' },
    { label: '12px', value: '12px' },
    { label: '14px', value: '14px' },
    { label: '16px', value: '16px' },
    { label: '18px', value: '18px' },
    { label: '20px', value: '20px' },
    { label: '24px', value: '24px' },
    { label: '32px', value: '32px' },
    { label: '36px', value: '36px' },
    { label: '38px', value: '38px' },
    { label: '40px', value: '40px' },
    { label: '44px', value: '44px' },
    { label: '46px', value: '46px' },
    { label: '50px', value: '50px' },
];

const EMPTY_LEXICAL_STATE = JSON.stringify({
    root: {
        children: [
            {
                children: [],
                direction: null,
                format: '',
                indent: 0,
                type: 'paragraph',
                version: 1,
            },
        ],
        direction: null,
        format: '',
        indent: 0,
        type: 'root',
        version: 1,
    },
});

// Toolbar Component
function ToolbarPlugin() {
    const t = useTranslations('comman.editor');
    const [editor] = useLexicalComposerContext();
    const [activeFormats, setActiveFormats] = useState({
        bold: false,
        italic: false,
        underline: false,
        strikethrough: false,
        code: false,
        isLink: false,
        textColor: '',
        bgColor: ''
    });
    const [blockType, setBlockType] = useState('paragraph');
    const [showImageDialog, setShowImageDialog] = useState(false);
    const [showLinkDialog, setShowLinkDialog] = useState(false);
    const [linkUrl, setLinkUrl] = useState('');
    const [textColor, setTextColor] = useState('');
    const [bgColor, setBgColor] = useState('');

    const updateToolbar = useCallback(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
            const selectionTextColor = $getSelectionStyleValueForProperty(selection, 'color', '#000000');
            const selectionBgColor = $getSelectionStyleValueForProperty(selection, 'background-color', '#ffffff');
            // Check if selection is a link to pre-fill the dialog
            const node = selection.getNodes()[0];
            const parent = node.getParent();
            let linkNode: LinkNode | null = null;

            if ($isLinkNode(node)) {
                linkNode = node as LinkNode;
            } else if ($isLinkNode(parent)) {
                linkNode = parent as LinkNode;
            }

            const hasLink = linkNode !== null;
            const url = hasLink ? linkNode.getURL() : '';
            setLinkUrl(url);
            setActiveFormats({
                bold: selection.hasFormat('bold'),
                italic: selection.hasFormat('italic'),
                underline: selection.hasFormat('underline'),
                strikethrough: selection.hasFormat('strikethrough'),
                code: selection.hasFormat('code'),
                textColor: selectionTextColor,
                bgColor: selectionBgColor,
                isLink: hasLink,
            });



            if ($isLinkNode(parent)) {
                setLinkUrl(parent.getURL());
            } else if ($isLinkNode(node)) {
                setLinkUrl(node.getURL());
            } else {
                setLinkUrl('');
            }
        }
    }, []);

    useEffect(() => {
        return editor.registerUpdateListener(({ editorState }) => {
            editorState.read(() => updateToolbar());
        });
    }, [editor, updateToolbar]);

    const formatText = (format: TextFormatType) => {
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
    };
    const insertLink = () => {
        if (linkUrl !== '') {
            if (!activeFormats.underline) {
                editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline');
            }

            // Apply the link
            editor.dispatchCommand(TOGGLE_LINK_COMMAND, linkUrl);

            setShowLinkDialog(false);
            setLinkUrl('');
        }
    };
    const onUnlink = useCallback(() => {
        editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
        setShowLinkDialog(false);
    }, [editor]);

    const [fontSize, setFontSize] = useState('16px');

    // Find the current option object based on state strings
    const selectedBlockOption = BLOCK_TYPE_OPTIONS.find(opt => opt.value === blockType) || BLOCK_TYPE_OPTIONS[0];
    const selectedSizeOption = FONT_SIZE_OPTIONS.find(opt => opt.value === fontSize) || FONT_SIZE_OPTIONS[3];

    const onFontSizeSelect = (option: any) => {
        const size = option.value;
        setFontSize(size);
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                $patchStyleText(selection, {
                    'font-size': size,
                });
            }
        });
    };

    const formatParagraph = () => {
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                $setBlocksType(selection, () => $createParagraphNode());
                $patchStyleText(selection, { 'font-size': null })
            }
        });
        setBlockType('paragraph');
    };

    const formatHeading = (headingSize: 'h1' | 'h2' | 'h3') => {
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                $setBlocksType(selection, () => $createHeadingNode(headingSize));
                $patchStyleText(selection, { 'font-size': null })
            }
        });
        setBlockType(headingSize);
    };

    const formatQuote = () => {
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                $setBlocksType(selection, () => $createQuoteNode());
                $patchStyleText(selection, { 'font-size': null })
            }
        });
        setBlockType('quote');
    };



    // Use your custom hook for Text Color
    useDebounce({
        value: textColor,
        delay: 200,
        onDebounce: (value) => {
            editor.update(() => {
                const selection = $getSelection();
                if ($isRangeSelection(selection)) {
                    $patchStyleText(selection, { color: value });
                }
            });
        }
    });

    // Use your custom hook for Background Color
    useDebounce({
        value: bgColor,
        delay: 200,
        onDebounce: (value) => {
            editor.update(() => {
                const selection = $getSelection();
                if ($isRangeSelection(selection)) {
                    $patchStyleText(selection, { 'background-color': value });
                }
            });
        }
    });
    const [isTextPickerOpen, setIsTextPickerOpen] = useState(false);
    const [isBgPickerOpen, setIsBgPickerOpen] = useState(false);

    const linkRef = useRef<HTMLDivElement>(null);
    useOutsideClick(linkRef, () => setShowLinkDialog(false))
    return (
        <div className="border-b border-gray/10 bg-gradient-to-r from-secondary/5 to-primary/5 p-3">
            <div className="flex flex-wrap gap-2">
                {/* Undo/Redo */}
                <div className="flex gap-1 border-r border-gray/10 pr-2">
                    <ToolbarButton
                        onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
                        icon={<MdUndo size={18} />}
                        tooltip="Undo"
                    />
                    <ToolbarButton
                        onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
                        icon={<MdRedo size={18} />}
                        tooltip="Redo"
                    />
                </div>

                {/* Block Type */}
                <div className="flex gap-1 border-r border-gray/10 pr-2">
                    <div className="flex gap-1 border-r border-gray/10 pr-2">
                        <SelectInput
                            options={BLOCK_TYPE_OPTIONS}
                            value={selectedBlockOption}
                            triggerClassName="!h-8 !w-32 !text-xs" // Tailoring to toolbar height
                            onChange={(opt) => {
                                const value = opt.value;
                                if (value === 'paragraph') formatParagraph();
                                else if (value === 'h1' || value === 'h2' || value === 'h3') formatHeading(value);
                                else if (value === 'quote') formatQuote();
                            }}
                        />
                    </div>

                    {/* Font Size Selector using SelectInput */}
                    <div className="flex gap-1 border-r border-gray/10 pr-2">
                        <SelectInput
                            options={FONT_SIZE_OPTIONS}
                            value={selectedSizeOption}
                            triggerClassName="!h-8 !w-24 !text-xs"
                            onChange={onFontSizeSelect}
                            placeholder="Size"
                        />
                    </div>
                </div>

                {/* Text Formatting */}
                <div className="flex gap-1 border-r border-gray/10 pr-2">
                    <ToolbarButton
                        onClick={() => formatText('bold')}
                        icon={<MdFormatBold size={18} />}
                        isActive={activeFormats.bold}
                        tooltip="Bold"
                    />
                    <ToolbarButton
                        onClick={() => formatText('italic')}
                        icon={<MdFormatItalic size={18} />}
                        isActive={activeFormats.italic}
                        tooltip="Italic"
                    />
                    <ToolbarButton
                        onClick={() => formatText('underline')}
                        icon={<MdFormatUnderlined size={18} />}
                        isActive={activeFormats.underline}
                        tooltip="Underline"
                    />
                    <ToolbarButton
                        onClick={() => formatText('strikethrough')}
                        icon={<MdStrikethroughS size={18} />}
                        isActive={activeFormats.strikethrough}
                        tooltip="Strikethrough"
                    />
                    <ToolbarButton
                        onClick={() => formatText('code')}
                        icon={<MdCode size={18} />}
                        isActive={activeFormats.code}
                        tooltip="Code"
                    />
                </div>

                {/* Lists */}
                <div className="flex gap-1 border-r border-gray/10 pr-2">
                    <ToolbarButton
                        onClick={() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)}
                        icon={<MdFormatListBulleted size={18} />}
                        tooltip="Bullet List"
                    />
                    <ToolbarButton
                        onClick={() => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)}
                        icon={<MdFormatListNumbered size={18} />}
                        tooltip="Numbered List"
                    />
                </div>

                {/* Alignment */}
                <div className="flex gap-1 border-r border-gray/10 pr-2">
                    <ToolbarButton
                        onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left')}
                        icon={<MdFormatAlignLeft size={18} />}
                        tooltip="Align Left"
                    />
                    <ToolbarButton
                        onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center')}
                        icon={<MdFormatAlignCenter size={18} />}
                        tooltip="Align Center"
                    />
                    <ToolbarButton
                        onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right')}
                        icon={<MdFormatAlignRight size={18} />}
                        tooltip="Align Right"
                    />
                    <ToolbarButton
                        onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'justify')}
                        icon={<MdFormatAlignJustify size={18} />}
                        tooltip="Justify"
                    />

                    {/* Text Color Section */}
                    <div className="relative">
                        <ToolbarButton
                            onClick={() => setIsTextPickerOpen(!isTextPickerOpen)}
                            // Icon color reflects selection
                            icon={<MdFormatColorText size={18} style={{ color: activeFormats.textColor }} />}
                            tooltip="Text Color"
                            isActive={isTextPickerOpen}
                        />
                        <ColorPickerDialog
                            title="Text Color"
                            isOpen={isTextPickerOpen}
                            color={textColor}
                            onChange={(hex) => setTextColor(hex)}
                            onReset={() => setTextColor('#000000')}
                            onClose={() => setIsTextPickerOpen(false)}
                        />
                    </div>

                    {/* Background Color Section */}
                    <div className="relative">
                        <ToolbarButton
                            onClick={() => setIsBgPickerOpen(!isBgPickerOpen)}
                            icon={<MdFormatColorFill size={18} style={{ color: activeFormats.bgColor }} />}
                            tooltip="Highlight"
                            isActive={isBgPickerOpen}
                        />
                        <ColorPickerDialog
                            title="Highlight"
                            isOpen={isBgPickerOpen}
                            color={bgColor}
                            onChange={(hex) => setBgColor(hex)}
                            onReset={() => setBgColor('#ffffff')}
                            onClose={() => setIsBgPickerOpen(false)}
                        />
                    </div>
                </div>


                {/* Insert */}
                <div className="flex gap-1">
                    <ToolbarButton
                        onClick={() => setShowImageDialog(true)}
                        icon={<MdImage size={18} />}
                        tooltip="Insert Image"
                    />
                    {showImageDialog && (
                        <InsertImageDialog
                            activeEditor={editor}
                            onClose={() => setShowImageDialog(false)}
                        />
                    )}
                    <div className="relative">
                        <ToolbarButton
                            onClick={() => setShowLinkDialog(!showLinkDialog)}
                            icon={<MdLink size={18} />}
                            tooltip={'Insert Link'}
                            isActive={showLinkDialog}
                        />

                        {showLinkDialog && (
                            <div ref={linkRef} className="absolute top-full left-0 mt-2 z-[60] p-4 border border-secondary/20 rounded-xl bg-white shadow-xl animate-in fade-in slide-in-from-top-2 duration-200 w-[300px]">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm font-bold text-dark flex items-center gap-2">
                                        <MdLink className="text-secondary" /> {t('link_dialog.url_label')}
                                    </span>
                                    <button
                                        onClick={() => setShowLinkDialog(false)}
                                        className="text-gray-400 hover:text-dark transition-colors"
                                    >
                                        <MdClose size={18} />
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    <input
                                        type="text"
                                        placeholder="https://..."
                                        value={linkUrl}
                                        onChange={(e) => setLinkUrl(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === 'Enter') insertLink(); }}
                                        className="w-full h-10 px-3 rounded-lg border border-gray/20 text-sm focus:border-secondary focus:ring-2 focus:ring-secondary/10 focus:outline-none transition-all"
                                        autoFocus
                                    />

                                    <div className="flex gap-2">
                                        <button
                                            disabled={!activeFormats.isLink}
                                            onClick={onUnlink}
                                            className="flex-1 px-3 py-2 rounded-lg border border-red-100 text-red-500 text-xs font-bold hover:bg-red-50 transition-all flex items-center justify-center gap-1"
                                        >
                                            <MdLinkOff size={16} /> {t('link_dialog.unlink')}
                                        </button>

                                        <button
                                            onClick={insertLink}
                                            className="flex-[2] px-4 py-2 rounded-lg bg-gradient-to-r from-secondary to-primary text-white text-sm font-bold hover:shadow-md active:scale-95 transition-all duration-200"
                                        >
                                            {t('link_dialog.apply')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>


        </div>
    );
}

function ToolbarButton({
    onClick,
    icon,
    isActive,
    tooltip
}: {
    onClick: () => void;
    icon: React.ReactNode;
    isActive?: boolean;
    tooltip?: string;
}) {
    return (
        <button
            onClick={onClick}
            title={tooltip}
            type='button'
            className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200",
                "hover:bg-white hover:shadow-sm",
                isActive
                    ? "bg-gradient-to-br from-secondary to-primary text-white shadow-sm"
                    : "text-dark hover:text-primary"
            )}
        >
            {icon}
        </button>
    );
}

// Main Rich Text Editor Component
interface RichTextEditorProps {
    label?: string;
    placeholder?: string;
    value?: string;
    editorStateRef: RefObject<EditorState | null>;
    error?: string;
    required?: boolean;
    disabled?: boolean;
    className?: string;
    minHeight?: string;
}

export default function RichTextEditor({
    label,
    placeholder,
    value,
    editorStateRef,
    error,
    required,
    disabled,
    className,
    minHeight = '300px',
}: RichTextEditorProps) {
    const t = useTranslations('comman');
    const defaultPlaceholder = placeholder || t('editor.placeholder')

    const initialConfig = {
        namespace: 'RichTextEditor',
        editorState: value ? (typeof value === 'object' ? JSON.stringify(value) : value) : EMPTY_LEXICAL_STATE,
        theme: {
            paragraph: 'mb-2',
            quote: 'border-l-4 border-secondary pl-4 italic my-4 text-dark/80',
            heading: {
                h1: 'text-3xl font-bold mb-4 text-dark',
                h2: 'text-2xl font-bold mb-3 text-dark',
                h3: 'text-xl font-semibold mb-2 text-dark',
            },
            list: {
                ul: 'list-disc list-inside mb-2',
                ol: 'list-decimal list-inside mb-2',
            },
            text: {
                bold: 'font-bold',
                italic: 'italic',
                underline: 'underline',
                strikethrough: 'line-through',
                code: 'bg-gray/10 px-1 py-0.5 rounded text-sm font-mono',
            },
            image: 'editor-image',
        },
        nodes: [
            HeadingNode,
            ListNode,
            ListItemNode,
            QuoteNode,
            CodeNode,
            CodeHighlightNode,
            TableNode,
            TableCellNode,
            TableRowNode,
            AutoLinkNode,
            LinkNode,
            ImageNode
        ],
        onError: (error: Error) => {
            console.error(error);
        },
    };

    return (
        <div className={cn("flex flex-col gap-2 w-full", className)}>
            {label && (
                <label className="text-input font-semibold text-sm flex items-center gap-1">
                    {label}
                    {required && <span className="text-red-500">*</span>}
                </label>
            )}

            <div className="relative group/editor">
                {/* Glow effect on focus */}
                <div className={cn(
                    "absolute -inset-0.5 bg-gradient-to-r from-secondary/20 to-primary/20 rounded-xl opacity-0 blur-sm transition-opacity duration-200",
                    !error && "group-focus-within/editor:opacity-100"
                )} />

                <div
                    className={cn(
                        "relative rounded-xl border-2 bg-white transition-all duration-200",
                        error
                            ? "border-red-300 bg-red-50/30"
                            : "border-gray/20 hover:border-secondary/40 group-focus-within/editor:border-secondary",
                        disabled && "bg-gray/5 opacity-60 cursor-not-allowed"
                    )}
                >
                    <LexicalComposer initialConfig={initialConfig}>
                        <ToolbarPlugin />
                        <div className="relative">
                            <RichTextPlugin
                                contentEditable={
                                    <ContentEditable
                                        className={cn(
                                            "p-4 focus:outline-none text-sm font-medium text-dark",
                                            "prose prose-sm max-w-none",
                                            "[&_h1]:text-3xl [&_h1]:font-bold [&_h1]:mb-4",
                                            "[&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mb-3",
                                            "[&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mb-2",
                                            "[&_ul]:list-disc [&_ul]:list-inside [&_ul]:mb-2",
                                            "[&_ol]:list-decimal [&_ol]:list-inside [&_ol]:mb-2",
                                            "[&_blockquote]:border-l-4 [&_blockquote]:border-secondary [&_blockquote]:pl-4 [&_blockquote]:italic",
                                            "[&_code]:bg-gray/10 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_code]:font-mono"
                                        )}
                                        style={{ minHeight }}
                                    />
                                }
                                placeholder={
                                    <div className="absolute top-4 rtl:right-4 ltr:left-4 text-placeholder text-sm font-medium pointer-events-none">
                                        {defaultPlaceholder}
                                    </div>
                                }
                                ErrorBoundary={LexicalErrorBoundary}
                            />
                            <OnChangePlugin onChange={(editorState) => {
                                editorStateRef.current = editorState;
                            }} />
                            <HistoryPlugin />
                            <AutoFocusPlugin />
                            <LinkPlugin />
                            <ListPlugin />
                            <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
                            <ImagesPlugin />
                        </div>
                    </LexicalComposer>
                </div>
            </div>

            <FormErrorMessage message={error} />
        </div>
    );
}