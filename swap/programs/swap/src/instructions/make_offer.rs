use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{Mint, TokenAccount, TokenInterface},
};


use crate::{transfered_tokens, Offer, ANCHOR_DISCRIMINATOR};

#[derive(Accounts)]
#[instruction[id:u64]]
pub struct MakeOffer<'info> {
    #[account(mut)]
    pub maker: Signer<'info>,

    #[account(mint::token_program=token_program)]
    pub token_mint_a: InterfaceAccount<'info, Mint>,

    #[account(mint::token_program=token_program)]
    pub token_mint_b: InterfaceAccount<'info, Mint>,

    #[account(
        mut,
        associated_token::mint = token_mint_a,
        associated_token::authority = maker,
        associated_token::token_program = token_program
    )]
    pub maker_token_account: InterfaceAccount<'info, TokenAccount>,

    #[account(
        init,
        payer = maker,
        space = ANCHOR_DISCRIMINATOR + Offer::INIT_SPACE,
        seeds = [b"offer", maker.key().as_ref(), id.to_le_bytes().as_ref()],
        bump
    )]
    pub offer: Account<'info, Offer>,

    #[account(
        init,
        payer= maker,
        associated_token::mint = token_mint_a,
        associated_token::authority = offer,
        associated_token::token_program = token_program
    )]
    pub vault: InterfaceAccount<'info, TokenAccount>,

    pub system_program: Program<'info, System>,

    pub token_program: Interface<'info, TokenInterface>,

    pub associated_token_program: Program<'info, AssociatedToken>,
}

pub fn send_offered_tokens_to_vault(
    ctx: &Context<MakeOffer>,
    token_giving_amount: u64,
) -> Result<()> {
    transfered_tokens(
    &ctx.accounts.maker_token_account,
    &ctx.accounts.vault,
    token_giving_amount,
    &ctx.accounts.token_mint_a,
    &ctx.accounts.maker,
    &ctx.accounts.token_program,
)?;

    Ok(())
}

pub fn save_offer(
    ctx: Context<MakeOffer>, 
    id: u64, 
    token_wanted_amount: u64,
) -> Result<()> {
    ctx.accounts.offer.set_inner(Offer { 
        id, 
        maker : ctx.accounts.maker.key(), 
        token_mint_a: ctx.accounts.token_mint_a.key(),
        token_mint_b: ctx.accounts.token_mint_b.key(), 
        token_want_amount: token_wanted_amount, 
        bump: ctx.bumps.offer
        });
    Ok(())
}
