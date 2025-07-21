#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("128NbyS6q124HMEngcTggvyhWwLz5ipfwmPe6GVBa2HH");

#[program]
pub mod todo {


    use super::*;

    pub fn add_todo(
        ctx:Context<InitializeTodo>,
        title: String,
        description: String,
    ) -> Result<()>{
        let todos = &mut ctx.accounts.todo;
        todos.title = title;
        todos.description = description;
        todos.done = false;
        Ok(())
    }


    pub fn update_todo(
        ctx:Context<UpdateTodo>,
        _title: String,
        description : String,
        done : bool
    )-> Result<()>{
        let todos = &mut ctx.accounts.todo;
        todos.description = description;
        todos.done = done;
        Ok(())
    }


    pub fn delete_todo(
        _ctx:Context<DeleteTodo>,
        _title : String
    )->Result<()>{
        Ok(())
    }

    
}


#[derive(Accounts)]
#[instruction(title:String)]
pub struct DeleteTodo<'info>{
    #[account(
        mut,
        seeds = [title.as_bytes() , owner.key().as_ref()],
        bump,
        close = owner
    )]
    pub todo : Account<'info, Todo>,

    #[account(mut)]
    pub owner :Signer<'info>,

    pub system_program: Program<'info, System>
}



#[derive(Accounts)]
#[instruction(title: String)]
pub struct UpdateTodo<'info>{
    #[account(
        mut,
        seeds = [title.as_bytes() , owner.key().as_ref()],
        bump,
        realloc =  8+ Todo::INIT_SPACE,
        realloc::payer = owner,
        realloc::zero = true
    )]

    pub todo : Account<'info, Todo>,

    #[account(mut)]
    pub owner: Signer<'info>,

    pub system_program : Program<'info, System>
}





#[derive(Accounts)]
#[instruction(title: String)]
pub struct InitializeTodo<'info>{
    #[account(
        init,
        payer = owner,
        space = 8 + Todo::INIT_SPACE,
        seeds = [title.as_bytes() , owner.key().as_ref()],
        bump
    )]
    pub todo : Account<'info, Todo>,

    #[account(mut)]
    pub owner : Signer<'info>,

    pub system_program : Program<'info, System>


}


#[account]
#[derive(InitSpace)]
pub struct Todo{

    #[max_len(100)]
    title : String,

    #[max_len(500)]
    description: String,

    done: bool
}
