export function ConstituentContactSection() {
    return (
        <div className="space-y-6 max-w-4xl">
            {/* Contact Information Card */}
            <div 
              className="overflow-hidden"
              style={{
                border: '1px solid var(--slds-g-color-border-base-1)',
                borderRadius: 'var(--slds-c-card-radius-border)',
                backgroundColor: 'var(--slds-g-color-background-base)'
              }}
            >
                <div 
                  className="px-4 py-3"
                  style={{
                    borderBottom: '1px solid var(--slds-g-color-border-base-1)',
                    backgroundColor: 'var(--slds-g-color-background-alt)'
                  }}
                >
                    <h3 className="text-[13px] font-semibold text-[#080707]">Contact Information</h3>
                </div>
                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <div 
                          className="text-[11px] font-medium mb-1"
                          style={{ color: 'var(--slds-g-color-text-weak)' }}
                        >
                            Primary Phone
                        </div>
                        <div className="text-[13px] font-medium text-[#080707]">-</div>
                    </div>
                    <div>
                        <div 
                          className="text-[11px] font-medium mb-1"
                          style={{ color: 'var(--slds-g-color-text-weak)' }}
                        >
                            Secondary Phone
                        </div>
                        <div className="text-[13px] font-medium text-[#080707]">-</div>
                    </div>
                    <div>
                        <div 
                          className="text-[11px] font-medium mb-1"
                          style={{ color: 'var(--slds-g-color-text-weak)' }}
                        >
                            Email
                        </div>
                        <div className="text-[13px] font-medium text-[#080707]">-</div>
                    </div>
                    <div>
                        <div 
                          className="text-[11px] font-medium mb-1"
                          style={{ color: 'var(--slds-g-color-text-weak)' }}
                        >
                            Preferred Contact Method
                        </div>
                        <div className="text-[13px] font-medium text-[#080707]">-</div>
                    </div>
                    <div className="sm:col-span-2">
                        <div 
                          className="text-[11px] font-medium mb-1"
                          style={{ color: 'var(--slds-g-color-text-weak)' }}
                        >
                            Mailing Address
                        </div>
                        <div className="text-[13px] font-medium text-[#080707]">-</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
