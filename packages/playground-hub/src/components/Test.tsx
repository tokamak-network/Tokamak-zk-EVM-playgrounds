import React from "react";

interface DataRow {
  id: string;
  hash: string;
}

const Test: React.FC = () => {
  const activeTab = "logs";

  // Sample data based on the Figma design
  const sampleData: DataRow[] = [
    {
      id: "0",
      hash: "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
    },
    {
      id: "1",
      hash: "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
    },
    {
      id: "2",
      hash: "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
    },
  ];

  const handleDownloadProof = () => {
    console.log("Download Proof clicked");
  };

  const handleSubmitProof = () => {
    console.log("Submit Proof clicked");
  };

  return (
    <div className="test-container">
      {/* Main Frame */}
      <div className="frame-container">
        {/* Modal */}
        <div className="modal">
          <div className="modal-border-left"></div>

          {/* Modal Body */}
          <div className="modal-body">
            <div className="content-wrapper">
              <div className="data-sections">
                {/* Topics Section */}
                <div className="data-group">
                  <div className="data-frame">
                    <div className="progress-bar-section">
                      <h3 className="section-title">Topics</h3>
                      <div className="data-rows">
                        {sampleData.map((item) => (
                          <div key={`topics-${item.id}`} className="data-row">
                            <div className="row-border-top"></div>
                            <div className="row-content">
                              <div className="row-border-left"></div>
                              <div className="hash-text">
                                {item.id}: {item.hash}
                              </div>
                              <div className="row-border-right"></div>
                            </div>
                            <div className="row-border-bottom"></div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Value (Decimal) Section */}
                    <div className="progress-bar-section">
                      <h3 className="section-title">Value (Decimal)</h3>
                      <div className="data-rows">
                        <div className="data-row">
                          <div className="row-border-top"></div>
                          <div className="row-content">
                            <div className="row-border-left"></div>
                            <div className="hash-text">
                              0:
                              0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef
                            </div>
                            <div className="row-border-right"></div>
                          </div>
                          <div className="row-border-bottom"></div>
                        </div>
                      </div>
                    </div>

                    {/* Value (Hex) Section */}
                    <div className="progress-bar-section">
                      <h3 className="section-title">Value (Hex)</h3>
                      <div className="data-rows">
                        <div className="data-row">
                          <div className="row-border-top"></div>
                          <div className="row-content">
                            <div className="row-border-left"></div>
                            <div className="hash-text">
                              0:
                              0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef
                            </div>
                            <div className="row-border-right"></div>
                          </div>
                          <div className="row-border-bottom"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tab */}
                  <div className="tab-container">
                    <div className="tab-frame">
                      <div className="tab-content">
                        <span className="tab-text">Data #2</span>
                      </div>
                      <div className="tab-bottom-border"></div>
                    </div>
                  </div>
                </div>

                {/* Scrollbar */}
                <div className="scrollbar">
                  <div className="scrollbar-top">
                    <div className="scrollbar-button">
                      <div className="scrollbar-border-top"></div>
                      <div className="scrollbar-content">
                        <div className="scrollbar-border-left"></div>
                        <div className="chevron-up">
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                          >
                            <path
                              d="M3.33 10.67L8 6L12.67 10.67"
                              stroke="#222222"
                              strokeWidth="1.33"
                            />
                          </svg>
                        </div>
                        <div className="scrollbar-border-right"></div>
                      </div>
                      <div className="scrollbar-border-bottom"></div>
                    </div>
                  </div>

                  <div className="scrollbar-handle">
                    <div className="handle-content">
                      <div className="handle-border-top"></div>
                      <div className="handle-middle">
                        <div className="handle-border-left"></div>
                        <div className="handle-border-right"></div>
                      </div>
                      <div className="handle-border-bottom"></div>
                    </div>
                  </div>

                  <div className="scrollbar-bottom">
                    <div className="scrollbar-button">
                      <div className="scrollbar-border-top"></div>
                      <div className="scrollbar-content">
                        <div className="scrollbar-border-left"></div>
                        <div className="chevron-down">
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                          >
                            <path
                              d="M12.67 6L8 10.67L3.33 6"
                              stroke="#222222"
                              strokeWidth="1.33"
                            />
                          </svg>
                        </div>
                        <div className="scrollbar-border-right"></div>
                      </div>
                      <div className="scrollbar-border-bottom"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-border-bottom"></div>
          </div>

          <div className="modal-border-right"></div>
        </div>

        {/* Tab Group */}
        <div className="tab-group">
          <div className={`large-tab ${activeTab === "logs" ? "active" : ""}`}>
            <div className="large-tab-content">
              <div className="large-tab-border-top"></div>
              <div className="large-tab-middle">
                <div className="large-tab-border-left"></div>
                <div className="large-tab-label">
                  <span className="large-tab-text">LOGS</span>
                </div>
                <div className="large-tab-border-right"></div>
              </div>
              <div className="large-tab-border-bottom"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="buttons-container">
        <button className="button secondary" onClick={handleDownloadProof}>
          <div className="button-content">
            <div className="button-border-top"></div>
            <div className="button-middle">
              <div className="button-border-left"></div>
              <div className="button-label">
                <span className="button-text">Download Proof</span>
              </div>
              <div className="button-border-right"></div>
            </div>
            <div className="button-border-bottom"></div>
          </div>
        </button>

        <button className="button primary" onClick={handleSubmitProof}>
          <div className="button-content">
            <div className="button-border-top"></div>
            <div className="button-middle">
              <div className="button-border-left"></div>
              <div className="button-label">
                <span className="button-text">Submit Proof</span>
              </div>
              <div className="button-border-right"></div>
            </div>
            <div className="button-border-bottom"></div>
          </div>
        </button>
      </div>

      <style>{`
        .test-container {
          display: flex;
          flex-direction: column;
          gap: 24px;
          width: 792px;
          font-family: 'IBM Plex Mono', monospace;
        }

        .frame-container {
          position: relative;
          width: 792px;
          height: 624px;
        }

        .modal {
          position: absolute;
          top: 42px;
          left: 0;
          display: flex;
          flex-direction: row;
          justify-content: center;
          align-items: center;
          width: 792px;
        }

        .modal-border-left {
          width: 1px;
          height: 100%;
          background-color: #DFDFDF;
        }

        .modal-body {
          display: flex;
          flex-direction: column;
          flex: 1;
          height: 582px;
          background-color: #BDBDBD;
        }

        .content-wrapper {
          display: flex;
          flex-direction: column;
          flex: 1;
          gap: 12px;
          padding: 8px;
        }

        .data-sections {
          display: flex;
          flex-direction: row;
          flex: 1;
        }

        .data-group {
          position: relative;
          width: 754px;
          height: 347px;
        }

        .data-frame {
          position: absolute;
          top: 22px;
          left: 0;
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 16px;
          width: 754px;
          background-color: #FFFFFF;
          border: 1px solid #5F5F5F;
        }

        .progress-bar-section {
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding: 0px 1px 1px 0px;
        }

        .section-title {
          font-family: 'IBM Plex Mono', monospace;
          font-weight: 500;
          font-size: 14px;
          line-height: 1.3;
          color: #222222;
          margin: 0;
        }

        .data-rows {
          display: flex;
          flex-direction: column;
        }

        .data-row {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          height: 40px;
          background-color: #F2F2F2;
        }

        .row-border-top {
          width: 100%;
          height: 1px;
          background-color: #5F5F5F;
        }

        .row-content {
          display: flex;
          flex-direction: row;
          align-items: center;
          gap: 8px;
          flex: 1;
          width: 100%;
        }

        .row-border-left {
          width: 1px;
          height: 100%;
          background-color: #5F5F5F;
        }

        .hash-text {
          flex: 1;
          font-family: 'IBM Plex Mono', monospace;
          font-weight: 400;
          font-size: 16px;
          line-height: 1.3;
          color: #222222;
          word-break: break-all;
        }

        .row-border-right {
          width: 1px;
          height: 100%;
          background-color: #DFDFDF;
        }

        .row-border-bottom {
          width: 100%;
          height: 1px;
          background-color: #DFDFDF;
        }

        .tab-container {
          position: absolute;
          top: 0;
          left: 0;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          align-items: center;
        }

        .tab-frame {
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          align-items: center;
          background-color: #FFFFFF;
          border: 1px solid #5F5F5F;
          border-radius: 2px 2px 0px 0px;
        }

        .tab-content {
          display: flex;
          flex-direction: row;
          justify-content: center;
          padding: 4px 8px;
        }

        .tab-text {
          font-family: 'IBM Plex Sans', sans-serif;
          font-weight: 500;
          font-size: 11px;
          line-height: 1.3;
          letter-spacing: 1.36%;
          color: #3B48FF;
        }

        .tab-bottom-border {
          width: 56px;
          height: 1px;
          background-color: #FFFFFF;
        }

        .scrollbar {
          width: 20px;
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .scrollbar-top,
        .scrollbar-bottom {
          width: 20px;
          height: 20px;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .scrollbar-button {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        .scrollbar-border-top,
        .scrollbar-border-bottom {
          width: 100%;
          height: 1px;
          background-color: #A8A8A8;
        }

        .scrollbar-content {
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          align-items: center;
          gap: 8px;
          width: 20px;
          height: 18px;
        }

        .scrollbar-border-left {
          width: 1px;
          height: 100%;
          background-color: #A8A8A8;
        }

        .scrollbar-border-right {
          width: 1px;
          height: 100%;
          background-color: #5F5F5F;
        }

        .chevron-up,
        .chevron-down {
          width: 16px;
          height: 16px;
        }

        .scrollbar-handle {
          width: 20px;
          height: 65px;
          display: flex;
          flex-direction: column;
          justify-content: stretch;
          align-items: stretch;
        }

        .handle-content {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          width: 20px;
          height: 100%;
        }

        .handle-border-top,
        .handle-border-bottom {
          width: 100%;
          height: 1px;
          background-color: #A8A8A8;
        }

        .handle-middle {
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          align-items: center;
          gap: 8px;
          width: 20px;
          flex: 1;
        }

        .handle-border-left {
          width: 1px;
          height: 100%;
          background-color: #A8A8A8;
        }

        .handle-border-right {
          width: 1px;
          height: 100%;
          background-color: #5F5F5F;
        }

        .modal-border-bottom {
          width: 100%;
          height: 1px;
          background-color: #5F5F5F;
        }

        .modal-border-right {
          width: 1px;
          height: 100%;
          background-color: #5F5F5F;
        }

        .tab-group {
          position: absolute;
          top: 0;
          left: 0;
          display: flex;
          flex-direction: row;
          align-items: flex-end;
          width: 79.42px;
        }

        .large-tab {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        .large-tab.active {
          background-color: #BDBDBD;
        }

        .large-tab-content {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        .large-tab-border-top {
          width: 100%;
          height: 1px;
          background-color: #DFDFDF;
        }

        .large-tab-middle {
          display: flex;
          flex-direction: row;
          justify-content: center;
          align-items: center;
          gap: 8px;
          height: 40px;
        }

        .large-tab-border-left {
          width: 1px;
          height: 100%;
          background-color: #DFDFDF;
        }

        .large-tab-label {
          display: flex;
          flex-direction: row;
          justify-content: center;
          padding: 2px 8px 0px;
        }

        .large-tab-text {
          font-family: 'IBM Plex Mono', monospace;
          font-weight: 500;
          font-size: 16px;
          line-height: 1.3;
          text-transform: uppercase;
          color: #222222;
        }

        .large-tab-border-right {
          width: 1px;
          height: 100%;
          background-color: #5F5F5F;
        }

        .large-tab-border-bottom {
          width: 100%;
          height: 1px;
          background-color: #BDBDBD;
        }

        .buttons-container {
          display: flex;
          flex-direction: row;
          justify-content: stretch;
          align-items: stretch;
          gap: 20px;
          width: 100%;
        }

        .button {
          display: flex;
          flex-direction: column;
          justify-content: stretch;
          align-items: stretch;
          flex: 1;
          height: 40px;
          border: none;
          cursor: pointer;
          background: transparent;
        }

        .button-content {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          flex: 1;
        }

        .button-border-top,
        .button-border-bottom {
          width: 100%;
          height: 1px;
          background-color: #A8A8A8;
        }

        .button-middle {
          display: flex;
          flex-direction: row;
          justify-content: center;
          align-items: center;
          gap: 8px;
          flex: 1;
          width: 100%;
        }

        .button.secondary .button-middle {
          background-color: #008BEE;
        }

        .button.primary .button-middle {
          background-color: #773FE0;
        }

        .button-border-left {
          width: 1px;
          height: 100%;
          background-color: #A8A8A8;
        }

        .button-label {
          display: flex;
          flex-direction: row;
          justify-content: center;
          align-items: center;
          gap: 12px;
          padding: 0px 4px;
          flex: 1;
        }

        .button-text {
          font-family: 'IBM Plex Mono', monospace;
          font-weight: 700;
          font-size: 16px;
          line-height: 1.3;
          color: #F8F8F8;
        }

        .button-border-right {
          width: 1px;
          height: 100%;
          background-color: #5F5F5F;
        }

        .button:hover .button-middle {
          opacity: 0.9;
        }

        .button:active .button-middle {
          opacity: 0.8;
        }
      `}</style>
    </div>
  );
};

export default Test;
