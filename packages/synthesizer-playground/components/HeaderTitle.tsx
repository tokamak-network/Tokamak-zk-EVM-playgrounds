export default function HeaderTitle({ children, shouldShowResults }: { children: React.ReactNode, shouldShowResults: boolean }) {
    
    return (
    <div className={`flex flex-col ${shouldShowResults ? 'gap-y-[17px]' : 'gap-y-[32px]'}`}>
        {children}
    </div>
)
}
