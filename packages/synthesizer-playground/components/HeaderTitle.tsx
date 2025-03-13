export default function HeaderTitle({ children, shouldShowResults, isSmallScreen }: { children: React.ReactNode, shouldShowResults: boolean, isSmallScreen: boolean }) {

    
    return (
    <div className={`flex flex-col ${shouldShowResults || isSmallScreen ? 'gap-y-[17px]' : 'gap-y-[32px]'}`}>
        {children}
    </div>
)
}
