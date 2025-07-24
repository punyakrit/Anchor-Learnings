use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Offer{
    pub id : u64,

    pub maker : Pubkey,

    pub token_mint_offer : Pubkey,

    pub token_mint_want : Pubkey,

    pub token_want_amount : u64,

    pub bump : u8
}