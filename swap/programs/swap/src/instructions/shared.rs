use anchor_lang::prelude::*;
use anchor_spl::{token, token_interface::*};

pub fn transfered_tokens<'info> (
    from : &InterfaceAccount<'info, TokenAccount>,
    to :&InterfaceAccount<'info, TokenAccount>,
    amount : u64,
    mint : &InterfaceAccount<'info, Mint>,
    authority : &Signer<'info>,
    token_program : &Interface<'info, TokenInterface>,
) -> Result<()>{

    let trnasfer_accounts_option = TransferChecked{
        from: from.to_account_info(),
        mint: mint.to_account_info(),
        to: to.to_account_info(),
        authority: authority.to_account_info(),
    };

    let cpi_context = CpiContext::new(
        token_program.to_account_info(), 
        trnasfer_accounts_option
    );

    transfer_checked(cpi_context, amount, mint.decimals);


    Ok(())

    
}