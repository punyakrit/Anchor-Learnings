#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("HhvX2QsSiNpuj5toMdptP4Lk976JjuwnTdVR2MKHtPgh");

#[program]
pub mod crud_app {
    use super::*;

    pub fn create_journal_entry(
        ctx: Context<CreateEntry>, 
        title: String, 
        message:String
    ) -> Result<()>{
        let journal_data = &mut ctx.accounts.journal_entry;
        journal_data.owner = *ctx.accounts.owner.key;
        journal_data.title = title;
        journal_data.message = message;

        Ok(())
    }

    pub fn update_journal(
        ctx: Context<UpdateEntry>,
        _title: String,
        message:String
    )-> Result<()>{
        let journal_data = &mut ctx.accounts.journal_entry;
        journal_data.message = message;
        Ok(())
    }

    pub fn delete_journal(
        _ctx:Context<DeleteEntry>,
        _title: String
    ) -> Result<()>{

        Ok(())
    }

}

#[derive(Accounts)]
#[instruction(title:String)]
pub struct CreateEntry<'info>{
    #[account(
        init,
        seeds = [title.as_bytes(), owner.key().as_ref()],
        bump,
        space = 8 + JournalEntry::INIT_SPACE,
        payer = owner
    )]
    pub journal_entry : Account<'info , JournalEntry>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program : Program<'info, System> 
}


#[derive(Accounts)]
#[instruction(title: String)]
pub struct UpdateEntry<'info>{
    #[account(
        mut,
        seeds = [title.as_bytes(), owner.key().as_ref()],
        bump,
        realloc =  8+ JournalEntry::INIT_SPACE,
        realloc::payer = owner,
        realloc::zero = true
    )]
    pub journal_entry : Account<'info, JournalEntry>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program : Program<'info, System>
}


#[derive(Accounts)]
#[instruction(title: String)]
pub struct DeleteEntry<'info>{
    #[account(
        mut,
        seeds = [title.as_bytes(), owner.key().as_ref()],
        bump,
        close = owner,
    )]
    pub journal_entry : Account<'info , JournalEntry>,

    #[account(mut)]
    pub owner: Signer<'info>,

    pub system_program: Program<'info, System>

}



#[account]
#[derive(InitSpace)]
pub struct JournalEntry{
    pub owner: Pubkey,
    #[max_len(50)]
    pub title: String,
    #[max_len(1000)]
    pub message: String,
}

