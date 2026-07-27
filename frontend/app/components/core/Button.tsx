export const PrimaryButton = ({ children, onClick }: { children: string, onClick?: () => void }) => {
    return <button
        type="button"
        onClick={onClick}
        className="text-center font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-accentBlue/40 hover:opacity-90 active:scale-[0.98] transition disabled:opacity-50 relative h-9 text-sm px-4 mr-3 text-baseTextHighEmphasis border border-baseBorderMed hover:border-baseBorderFocus hover:bg-baseBackgroundL2"
    >
        {children}
    </button>
}

export const SuccessButton = ({ children, onClick }: { children: string, onClick?: () => void }) => {
    return <button
        type="button"
        onClick={onClick}
        className="text-center font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-greenBorder/40 hover:opacity-90 active:scale-[0.98] transition disabled:opacity-50 relative h-9 text-sm px-4 bg-greenPrimaryButtonBackground text-greenPrimaryButtonText shadow-sm shadow-greenPrimaryButtonBackground/20"
    >
        {children}
    </button>
}
