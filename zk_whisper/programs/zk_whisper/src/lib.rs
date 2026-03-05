use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

/// Maximum length for string fields (district, ipfs_cid).
const MAX_STRING_LEN: usize = 64;

/// Maximum length for the category field.
const MAX_CATEGORY_LEN: usize = 32;

/// Number of echoes required to convert a report into a petition.
const PETITION_THRESHOLD: u64 = 100;

// ---------------------------------------------------------------------------
// Status enum
// ---------------------------------------------------------------------------

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum ReportStatus {
    Active,
    Petition,
    Resolved,
    Closed,
}

impl Default for ReportStatus {
    fn default() -> Self {
        ReportStatus::Active
    }
}

#[program]
pub mod zk_whisper {
    use super::*;

    /// Creates a new civic report on-chain.
    pub fn initialize_report(
        ctx: Context<InitializeReport>,
        report_id: u64,
        location_lat: f32,
        location_lng: f32,
        district: String,
        ward_number: u8,
        ipfs_cid: String,
        category: String,
    ) -> Result<()> {
        require!(district.len() <= MAX_STRING_LEN, ZkWhisperError::StringTooLong);
        require!(ipfs_cid.len() <= MAX_STRING_LEN, ZkWhisperError::StringTooLong);
        require!(category.len() <= MAX_CATEGORY_LEN, ZkWhisperError::CategoryTooLong);

        let report = &mut ctx.accounts.civic_report;
        report.reporter = ctx.accounts.reporter.key();
        report.report_id = report_id;
        report.location_lat = location_lat;
        report.location_lng = location_lng;
        report.district = district;
        report.ward_number = ward_number;
        report.ipfs_cid = ipfs_cid;
        report.category = category;
        report.upvotes = 0;
        report.is_petition = false;
        report.status = ReportStatus::Active;
        report.created_at = Clock::get()?.unix_timestamp;

        msg!(
            "📢 New whisper filed by {} in district {} ward {}",
            report.reporter,
            report.district,
            report.ward_number
        );
        Ok(())
    }

    /// Echoes (upvotes) an existing report.
    pub fn echo_report(ctx: Context<EchoReport>) -> Result<()> {
        let report = &mut ctx.accounts.civic_report;

        require!(
            report.status == ReportStatus::Active || report.status == ReportStatus::Petition,
            ZkWhisperError::ReportNotActive
        );

        report.upvotes = report.upvotes.checked_add(1).unwrap();

        if report.upvotes >= PETITION_THRESHOLD && report.status == ReportStatus::Active {
            report.is_petition = true;
            report.status = ReportStatus::Petition;
            msg!(
                "🟢 Report in {} ward {} is now a PETITION ({} echoes)!",
                report.district,
                report.ward_number,
                report.upvotes
            );
        } else {
            msg!(
                "🔴 Echo registered — {} / {} needed for petition",
                report.upvotes,
                PETITION_THRESHOLD
            );
        }

        Ok(())
    }

    /// Closes a report. Only the original reporter can close it.
    pub fn close_report(ctx: Context<CloseReport>) -> Result<()> {
        let report = &mut ctx.accounts.civic_report;
        report.status = ReportStatus::Closed;
        msg!(
            "🔒 Report in {} ward {} closed by reporter",
            report.district,
            report.ward_number
        );
        Ok(())
    }
}

// ---------------------------------------------------------------------------
// Accounts
// ---------------------------------------------------------------------------

#[derive(Accounts)]
#[instruction(report_id: u64)]
pub struct InitializeReport<'info> {
    #[account(
        init,
        payer = reporter,
        space = CivicReport::SPACE,
        seeds = [b"report", reporter.key().as_ref(), &report_id.to_le_bytes()],
        bump,
    )]
    pub civic_report: Account<'info, CivicReport>,

    #[account(mut)]
    pub reporter: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct EchoReport<'info> {
    #[account(mut)]
    pub civic_report: Account<'info, CivicReport>,

    #[account(
        init,
        payer = voter,
        space = EchoReceipt::SPACE,
        seeds = [b"echo", civic_report.key().as_ref(), voter.key().as_ref()],
        bump,
    )]
    pub echo_receipt: Account<'info, EchoReceipt>,

    #[account(mut)]
    pub voter: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CloseReport<'info> {
    #[account(
        mut,
        has_one = reporter @ ZkWhisperError::Unauthorized,
    )]
    pub civic_report: Account<'info, CivicReport>,

    pub reporter: Signer<'info>,
}

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

#[account]
pub struct CivicReport {
    pub reporter: Pubkey,        // 32
    pub report_id: u64,          // 8
    pub location_lat: f32,       // 4
    pub location_lng: f32,       // 4
    pub district: String,        // 4 + 64
    pub ward_number: u8,         // 1
    pub ipfs_cid: String,        // 4 + 64
    pub category: String,        // 4 + 32
    pub upvotes: u64,            // 8
    pub is_petition: bool,       // 1
    pub status: ReportStatus,    // 1
    pub created_at: i64,         // 8
}

impl CivicReport {
    pub const SPACE: usize = 8   // anchor discriminator
        + 32                      // reporter
        + 8                       // report_id
        + 4                       // location_lat
        + 4                       // location_lng
        + (4 + MAX_STRING_LEN)    // district
        + 1                       // ward_number
        + (4 + MAX_STRING_LEN)    // ipfs_cid
        + (4 + MAX_CATEGORY_LEN)  // category
        + 8                       // upvotes
        + 1                       // is_petition
        + 1                       // status
        + 8;                      // created_at
}

#[account]
pub struct EchoReceipt {}

impl EchoReceipt {
    pub const SPACE: usize = 8;
}

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

#[error_code]
pub enum ZkWhisperError {
    #[msg("String field exceeds the 64-byte maximum length.")]
    StringTooLong,
    #[msg("Category field exceeds the 32-byte maximum length.")]
    CategoryTooLong,
    #[msg("Report is not in an active state.")]
    ReportNotActive,
    #[msg("You are not authorized to perform this action.")]
    Unauthorized,
}
