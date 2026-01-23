declare module 'react-quill-new' {
    import React from 'react';
    
    export interface ReactQuillProps {
        theme?: string;
        modules?: any;
        formats?: string[];
        value?: string;
        defaultValue?: string;
        placeholder?: string;
        readOnly?: boolean;
        scrollingContainer?: string | HTMLElement;
        onChange?: (content: string, delta: any, source: string, editor: any) => void;
        onChangeSelection?: (range: any, source: string, editor: any) => void;
        onFocus?: (range: any, source: string, editor: any) => void;
        onBlur?: (previousRange: any, source: string, editor: any) => void;
        onKeyPress?: React.EventHandler<any>;
        onKeyDown?: React.EventHandler<any>;
        onKeyUp?: React.EventHandler<any>;
        style?: React.CSSProperties;
        className?: string;
        tabIndex?: number;
        bound?: string | number | HTMLElement; 
        children?: React.ReactElement<any>;
        preserveWhitespace?: boolean;
        ref?: React.Ref<any>;
    }

    export default class ReactQuill extends React.Component<ReactQuillProps> {
        focus(): void;
        blur(): void;
        getEditor(): any;
    }
}
