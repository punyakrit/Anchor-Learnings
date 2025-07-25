pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
pub use state::*;

declare_id!("DeHB8C8u4MheephroRWP8UWVbdo89W9UKMFB725x5hRf");

#[program]
pub mod swap {
    use super::*;

    pub fn make_offer(
        ctx: Context<MakeOffer>, 
        id: u64, 
        token_giving_amount: u64,
        token_wanted_amount : u64
    ) -> Result<()> {
        instructions::make_offer::send_offered_tokens_to_vault(&ctx,token_giving_amount)?;
        instructions::make_offer::save_offer(ctx,id,token_wanted_amount)
    }

    pub fn take_offer(
        ctx:Context<TakeOffer>
    ) -> Result<()>{
        instructions::take_offer::send_wanted_tokens_to_maker(&ctx)?;
        instructions::take_offer::withdraw_and_close_vault(&ctx)
    }
}
